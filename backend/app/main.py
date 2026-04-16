from fastapi import FastAPI
from . import models
from .database import engine
from .routers import livros, categorias, autores, leitores, emprestimos

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LibLivre API",
    description="API para o sistema de gerenciamento de bibliotecas",
    version="1.0.0"
)

app.include_router(livros.router)
app.include_router(categorias.router)
app.include_router(autores.router)
app.include_router(leitores.router)
app.include_router(emprestimos.router)

@app.get("/")
def read_root():
    return {"status": "A API do LibLivre está rodando perfeitamente!"}