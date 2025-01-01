from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NLP Analysis Demo",
    description="A demo service for NLP analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    """Model for analysis request"""
    text: str
    analysis_type: str = "all"  # all, sentiment, entities, keywords

class AnalysisResponse(BaseModel):
    """Model for analysis response"""
    sentiment: Dict[str, float]
    entities: List[Dict[str, Any]]
    keywords: List[str]
    execution_time: float

@app.post("/analyze")
async def analyze_text(request: AnalysisRequest) -> AnalysisResponse:
    """Analyze text using NLP techniques"""
    try:
        start_time = datetime.now()
        
        # Placeholder analysis results
        analysis = {
            "sentiment": {
                "positive": 0.8,
                "negative": 0.1,
                "neutral": 0.1
            },
            "entities": [
                {"text": "example", "type": "EXAMPLE", "confidence": 0.9}
            ],
            "keywords": ["sample", "keywords", "for", "testing"]
        }
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return AnalysisResponse(
            sentiment=analysis["sentiment"],
            entities=analysis["entities"],
            keywords=analysis["keywords"],
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing text: {str(e)}"
        )

@app.get("/status")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
