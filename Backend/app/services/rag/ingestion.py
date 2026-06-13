import json
from pathlib import Path
from typing import List, Dict, Any
from app.services.rag.retriever import Document, DocumentRetriever
from app.core.config import logger

class DataIngestionService:
    """
    Ingests raw client dataset files (products, materials, collections, FAQs)
    from JSON files, links internal references, formats descriptions, and loads
    them as searchable Documents into the DocumentRetriever.
    """
    def __init__(self, retriever: DocumentRetriever):
        self.retriever = retriever
        # Resolve path to the 'data' folder at backend root relative to this file
        self.data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data"

    def load_json_file(self, filename: str) -> List[Dict[str, Any]]:
        file_path = self.data_dir / filename
        if not file_path.exists():
            logger.warning(f"Seed data file not found: {file_path}. Creating an empty template.")
            # Ensure parent directories exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump([], f)
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read seed data file {file_path}: {str(e)}")
            return []

    def ingest_all(self):
        logger.info(f"Starting data ingestion from path: {self.data_dir}")
        
        # Load the 4 datasets
        products = self.load_json_file("products.json")
        materials = self.load_json_file("materials.json")
        collections = self.load_json_file("collections.json")
        faqs = self.load_json_file("faqs.json")

        # Create quick-lookup maps
        material_lookup = {m["id"]: m for m in materials}
        collection_lookup = {c["id"]: c for c in collections}

        documents: List[Document] = []

        # 1. Process Products
        for prod in products:
            prod_id = prod.get("id")
            name = prod.get("name")
            category = prod.get("category", "")
            price = prod.get("price")
            availability = prod.get("availability", "")
            description = prod.get("description", "")
            specs = prod.get("specifications", {})
            mat_id = prod.get("material_id")
            coll_id = prod.get("collection_id")

            # Link & resolve material info
            mat_details = ""
            material_name = ""
            if mat_id in material_lookup:
                m = material_lookup[mat_id]
                material_name = m.get("name", "")
                mat_details = f"Material details: {m.get('name')} - {m.get('description')}"

            # Link & resolve collection info
            coll_details = ""
            collection_name = ""
            if coll_id in collection_lookup:
                c = collection_lookup[coll_id]
                collection_name = c.get("name", "")
                coll_details = f"Collection details: {c.get('name')} - {c.get('description')}"

            # Format specifications
            spec_str = ", ".join([f"{k}: {v}" for k, v in specs.items()])

            content = (
                f"Product Name: {name}\n"
                f"Category: {category}\n"
                f"Price: ${price}\n"
                f"Availability: {availability}\n"
                f"Description: {description}\n"
                f"Specifications: {spec_str}\n"
                f"Material Name: {material_name}\n"
                f"{mat_details}\n"
                f"Collection Name: {collection_name}\n"
                f"{coll_details}"
            )

            metadata = {
                "type": "product",
                "id": prod_id,
                "name": name,
                "category": category,
                "price": price,
                "availability": availability,
                "material_id": mat_id,
                "collection_id": coll_id,
                "source": "products.json"
            }
            documents.append(Document(doc_id=f"prod_{prod_id}", content=content, metadata=metadata))

        # 2. Process Materials
        for mat in materials:
            mat_id = mat.get("id")
            name = mat.get("name")
            desc = mat.get("description", "")
            care = mat.get("care_instructions", "")
            cert = mat.get("certifications", "")

            content = (
                f"Material Name: {name}\n"
                f"Description: {desc}\n"
                f"Care Instructions: {care}\n"
                f"Certifications: {cert}"
            )

            metadata = {
                "type": "material",
                "id": mat_id,
                "name": name,
                "source": "materials.json"
            }
            documents.append(Document(doc_id=f"mat_{mat_id}", content=content, metadata=metadata))

        # 3. Process Collections
        for coll in collections:
            coll_id = coll.get("id")
            name = coll.get("name")
            desc = coll.get("description", "")
            year = coll.get("launch_year", "")

            content = (
                f"Collection Name: {name}\n"
                f"Description: {desc}\n"
                f"Launch Year: {year}"
            )

            metadata = {
                "type": "collection",
                "id": coll_id,
                "name": name,
                "source": "collections.json"
            }
            documents.append(Document(doc_id=f"coll_{coll_id}", content=content, metadata=metadata))

        # 4. Process FAQs
        for idx, faq in enumerate(faqs):
            category = faq.get("category", "")
            question = faq.get("question", "")
            answer = faq.get("answer", "")

            content = (
                f"FAQ Category: {category}\n"
                f"Question: {question}\n"
                f"Answer: {answer}"
            )

            metadata = {
                "type": "faq",
                "category": category,
                "question": question,
                "source": "faqs.json"
            }
            documents.append(Document(doc_id=f"faq_{idx}", content=content, metadata=metadata))

        # Load into retriever memory index
        self.retriever.set_documents(documents)
        logger.info(f"Data ingestion complete. Ingested {len(documents)} search records.")
