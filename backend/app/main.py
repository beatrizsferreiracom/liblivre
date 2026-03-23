from fastapi import FastAPI
from . import models
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LibLivre API",
    description="API para o sistema de gerenciamento de bibliotecas",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "A API do LibLivre está rodando perfeitamente!"}