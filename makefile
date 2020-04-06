PULUMI_OWNER=yournamehere
PULUMI_STACK_NAME=yourstacknamehere
PULUMI_ACCESS_TOKEN=youraccesstokenhere

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