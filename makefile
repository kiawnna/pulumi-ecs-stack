PULUMI_OWNER=kiawnna
PULUMI_STACK_NAME=blackbird_ai_infrastructure
PULUMI_ACCESS_TOKEN=pul-e80882d62d9220f1cb06c835eb90c7bf3a16f046

.ONESHELL:
login:
		@echo "Logging in to Pulumi..."
		PULUMI_ACCESS_TOKEN=$(PULUMI_ACCESS_TOKEN) pulumi login
		@echo "Done."
		
.ONESHELL:
preview:
		@echo "Showing infrastructure changes preview..."
		AWS_PROFILE=default pulumi preview -s $(PULUMI_OWNER)/$(PULUMI_STACK_NAME)/prod
		@echo "Done."
		
.ONESHELL:
deploy:
		@echo "Showing infrastructure changes preview..."
		AWS_PROFILE=default pulumi up -s $(PULUMI_OWNER)/$(PULUMI_STACK_NAME)/prod
		
.ONESHELL:
prepare:
		curl -fsSL https://get.pulumi.com | sh
		npm install