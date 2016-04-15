BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)
TYPESCRIPT_BASENAMES = $(basename $(TYPESCRIPT))

all: $(TYPESCRIPT_BASENAMES:%=%.js) .gitignore build/site.css

.gitignore: tsconfig.json
	echo $(TYPESCRIPT_BASENAMES:%=%.js) demo/ | tr ' ' '\n' > $@

$(BIN)/tsc $(BIN)/lessc $(BIN)/cleancss:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

%.js: %.tsx $(BIN)/tsc
	$(BIN)/tsc

build/site.css: site.less $(BIN)/lessc $(BIN)/cleancss
	@mkdir -p $(@D)
	$(BIN)/lessc $< | $(BIN)/cleancss --keep-line-breaks --skip-advanced >$@

dev:
	(\
    $(BIN)/electron . & \
    $(BIN)/tsc --watch & \
    modd & \
    wait)
