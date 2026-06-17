import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import RecommendationHistory
from app.core.config import logger
from app.services.llm_service import llm_service

class RecommendationService:
    @staticmethod
    def get_all_products() -> List[Dict[str, Any]]:
        """
        Loads the structured product list from products.json.
        """
        file_path = Path(__file__).resolve().parent.parent.parent / "data" / "products.json"
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load product catalog from {file_path}: {str(e)}")
            return []

    @classmethod
    def score_and_rank_products(cls, slots: dict) -> List[dict]:
        """
        Calculates a deterministic matching score for all products based on active slots.
        """
        products = cls.get_all_products()
        scored_products = []
        
        category = slots.get("category")
        material = slots.get("material")
        budget_min = slots.get("budget_min")
        budget_max = slots.get("budget_max")
        occasion = slots.get("occasion")
        collection = slots.get("collection")
        
        for prod in products:
            prod_category = prod.get("category")
            
            # Hard Filter: If category is requested, reject mismatched product categories
            if category and prod_category and prod_category.lower() != category.lower():
                continue
                
            score = 0
            matches = []
            
            # 1. Category Match (+10 points)
            if category and prod_category and prod_category.lower() == category.lower():
                score += 10
                matches.append("category")
                
            # 2. Material Match (+5 points)
            prod_material = prod.get("material_id", "")
            if material and prod_material:
                # Handle synonyms and direct match (e.g. 18k-gold matches gold/yellow gold)
                mat_clean = material.lower().replace("-", " ")
                prod_mat_clean = prod_material.lower().replace("-", " ")
                if mat_clean in prod_mat_clean or prod_mat_clean in mat_clean:
                    score += 5
                    matches.append("material")
                    
            # 3. Budget Match (+5 points)
            price = prod.get("price")
            if price is not None:
                if budget_min is not None and budget_max is not None:
                    if budget_min <= price <= budget_max:
                        score += 5
                        matches.append("budget")
                elif budget_max is not None:
                    if price <= budget_max:
                        score += 5
                        matches.append("budget")
                elif budget_min is not None:
                    if price >= budget_min:
                        score += 5
                        matches.append("budget")
                        
            # 4. Occasion Match (+3 points)
            desc = prod.get("description", "").lower()
            name = prod.get("name", "").lower()
            if occasion:
                occ_clean = occasion.lower()
                if occ_clean in desc or occ_clean in name:
                    score += 3
                    matches.append("occasion")
                    
            # 5. Collection Match (+4 points)
            prod_collection = prod.get("collection_id", "")
            if collection and prod_collection:
                if collection.lower() == prod_collection.lower():
                    score += 4
                    matches.append("collection")
                    
            scored_products.append({
                "product": prod,
                "score": score,
                "matches": matches
            })
            
        # Sort products by score descending
        scored_products.sort(key=lambda x: x["score"], reverse=True)
        return scored_products

    @staticmethod
    def save_recommendation_history(
        db: Session, session_id: str, user_id: Optional[str], query: str, scored_products: List[dict]
    ):
        """
        Persists a trace of the algorithmic suggestion list into the database.
        """
        try:
            # Save top 3 suggested products
            top_products = [p["product"]["id"] for p in scored_products[:3]]
            scores_dict = {p["product"]["id"]: p["score"] for p in scored_products[:3]}
            
            history_record = RecommendationHistory(
                id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                query=query,
                recommended_products=top_products,
                scores=scores_dict
            )
            db.add(history_record)
            db.commit()
            logger.info(f"Saved recommendation history for session {session_id}.")
        except Exception as e:
            logger.error(f"Failed to save recommendation history: {str(e)}")

    @classmethod
    def generate_recommendation_response(cls, slots: dict, scored_products: List[dict]) -> str:
        """
        Generates an LLM presentation of the selected products, grounding Groq to explain them.
        """
        top_matches = scored_products[:3]
        
        # If no products matched or scores are too low, explain gracefully
        if not top_matches or all(p["score"] <= 0 for p in top_matches):
            return "I searched our catalog, but I couldn't find any products matching your specific constraints. Would you like to adjust your budget or try another metal?"

        # Format details of recommended products for system prompt
        context_products = []
        for idx, item in enumerate(top_matches):
            p = item["product"]
            specs_str = ", ".join([f"{k}: {v}" for k, v in p.get("specifications", {}).items()])
            context_products.append(
                f"[{idx + 1}] Product ID: {p.get('id')}\n"
                f"Name: {p.get('name')}\n"
                f"Category: {p.get('category')}\n"
                f"Price: ${p.get('price')}\n"
                f"Availability: {p.get('availability')}\n"
                f"Description: {p.get('description')}\n"
                f"Specifications: {specs_str}"
            )
            
        products_context = "\n\n---\n\n".join(context_products)
        
        system_content = (
            "You are a sales assistant for Indhulya jewelry. The recommendation system has selected the following matching products:\n\n"
            f"{products_context}\n\n"
            "Your instructions:\n"
            "1. Present the matching products to the user with enthusiasm, highlighting their price, metals, and gemstones.\n"
            "2. Explain why they are selected based on the user's criteria (slots):\n"
            f"   - Category: {slots.get('category')}\n"
            f"   - Material: {slots.get('material')}\n"
            f"   - Budget range: ${slots.get('budget_min') or 0} to ${slots.get('budget_max') or 'any'}\n"
            f"   - Occasion: {slots.get('occasion')}\n"
            f"   - Collection: {slots.get('collection')}\n"
            "3. Strictest rule: Do not recommend or invent any products that are not listed above. Mention only the provided products. Do not hallucinate specifications.\n"
            "4. Keep the response helpful, engaging, and professional."
        )
        
        messages = [
            {"role": "system", "content": system_content},
            {"role": "user", "content": "Explain why these products match my preferences and present them to me."}
        ]
        
        return llm_service.generate_chat_response(messages)
