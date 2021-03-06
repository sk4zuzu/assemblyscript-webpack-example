KEY ?= 12345

TARGETS := $(patsubst pics/%.jpg,dist/%.jpg,$(wildcard pics/*.jpg))

export

.PHONY: all check clean pics

all: pics build

check:
	@if [[ "$(KEY)" = 12345 ]]; then \
	    echo "ERROR: Please provide some real password"; \
	    exit 1; \
	fi >&2

clean:
	-rm -rf \
	    $(TARGETS) \
	    dist/list.json \
	    dist/main.js \
	    $(wildcard dist/*.wasm) \
	    $(wildcard dist/*.wasm.map) \
	    $(wildcard dist/*.wat) \
	    node_modules/

pics: check $(TARGETS) dist/list.json

dist/list.json: $(TARGETS)
	echo -n "$(patsubst dist/%,%,$^)" | jq --raw-input --slurp 'split(" ") | sort' | tee $@

dist/%.jpg: pics/%.jpg
	openssl rc4-40 -nopad -nosalt -K $(shell echo -ne $(KEY) | xxd -p) -e -in $< -out $@

.PHONY: build serve

build: node_modules/
	npm run asbuild && npm run build

serve: node_modules/
	npm run start:dev

node_modules/:
	npm install
