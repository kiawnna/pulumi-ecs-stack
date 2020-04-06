# Secure ECS Service App stack with autoscaling and loadblanacing via Pulumi Platform

This project will crBeate a new app from a docker image using a user-provided ECRurl via AWS's ECS service.
The app created will be automatically load-balanced and auto-scaled on EC2 instances. All
underlying infrastructure, including a vpc, subnets, security groups, ECS clusters, load-balancers,
autosclaing group for your EC2 instances, listeners, listerner rules and target groups, will be
automatically provisioned for you when you deploy.

This project runs on Pulumi, a free opensource cloudformation platform similar to Terraform,
Ansible, and the AWS-CDK. We chose Pulumi because it is cloud agnostic, more intuitive than Terraform
and Ansible, and takes fewer lines of code to create complex infrastructure than other platforms.

The first time this project is set up and deployed it should take you 20 minutes or less, depending on
comfort working with AWS and scripts. The initial setup only happens once, and from there every new app
afterward only uses Step 3 (from below) and then the command `make deploy`. That means for that every
new API that needs to be launched will take less than 5 minutes to get deployed.

# Prerequisites:
Before the Getting Started section, make sure you have made a new image and pushed it to AWS ECR.
You will need to copy the ECRUrl from the image into the index.ts file. You also need to create a free
Pulumi account early on as new accounts can take a few hours to validate.

# Getting Started:
Below is a quick outline of the steps needed to deploy your first app using this Pulumi template.

## INITIALLY:
Do all 5 steps the first time you set up an app.
## NEW APPS:
Only do Step 3 and the command `make deploy`.

### Step 1: Certificate and New Paramter
- Create a certificate for your fomain and a new secure-string parameter for your these values '/aiAPI/certArn'.
- '/aiAPI/certArn' should be a verified AWS Certificate Manager certificate, to enable HTTPS traffic through your
load balancer.
- Request a certificate and validate it through EMAIL or DNS. Once it is validated, copy the ARN of the
certificate and go to AWS Systems Manager. Create a new Secure String Parameter called '/aiAPIcertArn' (spelling
and capitalization is important). Paste the arn you copied into the value field and create the parameter.

### Step 2: New Pulumi Stack and Update makefile
- Create a new Pulumi stack in the Pulumi dashboard.
- Create a new acecss roken and copy it (you will only see it once) into the makefile.
- Go to the makefile and copy the access token into the makefile. In the makefile, you also need ot update the
Pulumi owner field and the stack name field to yourself and the name of the new stack you just created, respectively.
get your access token and update your makefile

### Step 3: Update the index.ts file to have the correct values specific to your app
- Go to the index.ts file and update the following fields: domainName, and all the values under const apps (name,
healthCheckPath, port, ecrUrl, desiredCount). You can optionally update the region as well. It is currently set to us-west-2.
Right now, the instanceType field lowerdown the file is set to: r5.2xlarge, so if you want a different instanceType, specify so.

### Step 4: Run the following commands from your makefile, in the order listed:
```
make prepare
```
This command will install pulumi and all the dependicies this app needs to run
```
make login
```
This command will log you in to Pulumi using the account name and access token you provided in a previous step. 
```
make deploy
```
This command will deploy your app and all the necessary AWS resources.

### Step 5: Create a subdomain and point it at the loadbalancer and create an autoscaling policy for your ECS tasks
- Create a subdomain (in AWS Route53 if that is what you use) and point it at the loadbalancer that was just created.
To do this in AWS Route53, go to your Hosted Zones and create a new record set. Check "Yes" for Alias and in the drop down
list the name of your loadbalancer should appear.
- Lastly, create an autoscaling policy for your ECS tasks. Pulumi does not have functionality to autoscale ECS tasks, so
this step must be done manually.

## Future add-ons could include:
Optional things you can do later with this project:
    -Parameterizing tokens
    -Moving to spotinst
    -Automating with a bitbucket pipeline, circleci, etc.
    -Multiple environments