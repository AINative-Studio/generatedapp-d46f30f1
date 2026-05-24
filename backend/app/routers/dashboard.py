"""
Dashboard router — GeneratedApp
Proxies to AINative ZeroDB for storage. Requires AINative JWT in Authorization header.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import httpx

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

AINATIVE_API_BASE = "https://api.ainative.studio/api/v1"


async def get_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.removeprefix("Bearer ").strip()


class ItemCreate(BaseModel):
    content: str
    tags: List[str] = []


class ItemResponse(BaseModel):
    id: str
    content: str
    tags: List[str]
    created_at: str


@router.get("/", response_model=List[ItemResponse])
async def list_items(token: str = Depends(get_token)):
    """List all Dashboard items via ZeroMemory recall."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{AINATIVE_API_BASE}/public/memory/v2/recall",
            json={"query": "dashboard", "layer": "episodic", "limit": 50},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory recall failed")
    data = resp.json()
    memories = data.get("memories", [])
    return [
        ItemResponse(id=m["id"], content=m["content"], tags=m.get("tags", []), created_at=m["created_at"])
        for m in memories
    ]


@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(body: ItemCreate, token: str = Depends(get_token)):
    """Store a Dashboard item via ZeroMemory remember."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{AINATIVE_API_BASE}/public/memory/v2/remember",
            json={
                "content": body.content,
                "memory_type": "episodic",
                "tags": ["dashboard"] + body.tags,
                "importance": 0.7,
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory remember failed")
    m = resp.json()
    return ItemResponse(id=m["id"], content=m["content"], tags=m.get("tags", []), created_at=m["created_at"])


@router.delete("/{item_id}")
async def delete_item(item_id: str, token: str = Depends(get_token)):
    """Delete a Dashboard item via ZeroMemory forget."""
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{AINATIVE_API_BASE}/public/memory/v2/forget/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory forget failed")
    return {"deleted": item_id}
