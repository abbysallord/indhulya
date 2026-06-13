from fastapi import APIRouter

router = APIRouter()

@router.get("", response_model=dict)
def health_check():
    """
    Simple health check endpoint returning status OK.
    """
    return {"status": "ok"}
