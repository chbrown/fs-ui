BIN := node_modules/.bin
DTS := async/async lodash/lodash moment/moment node/node react/react

all: app.js site.css

type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)
type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

$(BIN)/tsc $(BIN)/lessc $(BIN)/cleancss $(BIN)/watsh:
	npm install

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

%.js: %.tsx type_declarations $(BIN)/tsc
	$(BIN)/tsc --jsx react -m commonjs -t ES5 $<

%.css: %.less $(BIN)/lessc $(BIN)/cleancss
	$(BIN)/lessc $< | $(BIN)/cleancss --keep-line-breaks --skip-advanced -o $@

dev: $(BIN)/watsh
	$(BIN)/watsh 'make site.css' site.less
