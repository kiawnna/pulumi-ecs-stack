# Blackbird AI App

This project will create a new app from a docker image using an ECRurl via AWS's ECS service.
The app created will be automatically load-balanced and auto-scaled on EC2 instances. All
underlying infrastructure, including a vpc, subnets, security groups, ECS clusters, load-balancers,
autosclaing group for your EC2 instances, listeners, listerner rules and target groups, will be
automatically provisioned for you when you deploy.

This project runs on Pulumi, a free opensource cloudformation platform similar to Terraform,
Ansible, and the AWS-CDK. We chose Pulumi because it is cloud agnostic, more intuitive than Terraform
and Ansible, and takes fewer lines of code to create complex infrastructure than other platforms.

The first time you set up this project should take you 20 minutes or less, and anything you'd
like to give us access to do we will happily do for you. You only have to do the initial setup
once, and from there every new app afterward only uses Step 3 (from below) and then the command
make deploy. What that means for you is that every new API you launch will take less than 5 minutes.

# Prerequisites:
Before the Getting Started section, make sure you have merged our pull request, made a new image
with the health check that is in the pull request, and have pushed that image to AWS ECR. You will
need to copy the ECRUrl from the image into the index.ts file.

# Getting Started: Below is a quick outline of the steps with links to the screencast videos that will
walk you through each of them.
INITIALLY: Do all 5 steps the first time you set up an app.
NEW APPS: Only do Step 3 and the command make deploy.

Step 1: Create a certificate and new secure-string parameter for your app
https://www.loom.com/share/e9f3cf7963da4df3afdf81ac5b41233d

Step 2: Create a free Pulumi account, create your first stack, get your access token and update your makefile
https://www.loom.com/share/0fca46733336445d92055dceca599f46

Step 3: Update the index.ts file to have the correct values specific to your app
https://www.loom.com/share/4f637a394da14ccd9651c040261ef5ab

Step 4: Run the following commands from your makefile, in the order listed:
    - make prepare: this command will install pulumi and all the dependicies this app needs to run
    - make login: this command will log you in to Pulumi using the account name and access token you provided
    in a previous step
    - make deploy: this command will deploy your app and all the necessary AWS resources
https://www.loom.com/share/a6566f5e0355498bad2281f2739f6e1c

Step 5: Create a subdomain and point it at the loadbalancer and create an autoscaling policy for your ECS tasks
https://www.loom.com/share/d1b3a1183d164396add699ecdf043e00

# Stretch Goals
Optional things you can do later with this project:
    -Parameterizing tokens
    -Moving to spotinst
    -Automating with a bitbucket pipeline, circleci, etc.
    -Multiple environments