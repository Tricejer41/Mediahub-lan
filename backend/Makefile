VENV=. .venv/bin/activate

test:
	$(VENV) && pytest

lint:
	$(VENV) && ruff check .

fmt:
	$(VENV) && ruff format .

qa: lint test
