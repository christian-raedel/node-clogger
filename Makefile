all: clean install test

install:
	@echo "************************"
	@echo "* INSTALL DEPENDENCIES *"
	@echo "************************"
	@npm install

test:
	@echo "************************"
	@echo "* TEST LIBRARY         *"
	@echo "************************"
	@./node_modules/.bin/mocha --recursive test/*.spec.js

clean:
	@echo "************************"
	@echo "* CLEANUP DIRECTORY    *"
	@echo "************************"
	-@rm -rf ./node_modules

.PHONY: all install test
