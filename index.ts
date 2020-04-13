import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {SSM} from 'aws-sdk';

// INITIAL Create SSM Parameters for these values: ['/aiAPI/certArn', '/aiAPI/exampleEcrUrl']
// '/aiAPI/certArn' should be a verified AWS Certificate Manager certificate, to enable HTTPS traffic through your load
const region = 'us-west-2'

const ssm = new SSM({
    region: region
});

interface ssmObjectParams {
    certArn: string
};

const ssmObject: ssmObjectParams = {
    certArn: ''
};

// INITIAL set domainName to your domain name that will be pointed at a load balancer
const domainName = 'YOUR-DOMAIN-NAME-HERE.COM'
const instanceType = 't2.medium'
const ebsVolumeSize = 100

// NEW_APP Copy a JSON object and give it new application-specific values
const apps = [
    {
        name: 'YOUR-API-NAME-HERE',
        healthCheckPath: '/YOURHEALTHCHECKPATH/HERE',
        port: 'YOUR-PORT-HERE',
        ecrUrl: 'your-ecr-url-here',
        desiredCountTasks: 1,
        containerMemory: 10240,
        containerCPU: 1280
        
    },
    {
        name: 'second-api',
        healthCheckPath: '/YOURHEALTHCHECKPATH/HERE',
        port: 'YOUR-PORT-HERE',
        ecrUrl: 'your-ecr-url-here',
        desiredCountTasks: 1,
        ccontainerMemory : 10240,
        containerCPU: 1280
            
    }
];

async function getParameters(path: string) {
    let ssmEnvParams: SSM.GetParametersByPathRequest;
    ssmEnvParams = {
        Path: path,
    };
    const ssmEnvParameters = await ssm.getParametersByPath(ssmEnvParams).promise();

    // @ts-ignore
    ssmEnvParameters.Parameters.map(x => {
        // @ts-ignore
        ssmObject[x.Name.replace('/aiAPI/', '')] = x.Value
    });
}

async function main() {

    await getParameters('/aiAPI');

    const vpc = new awsx.ec2.Vpc("aiApi", {
        cidrBlock: "10.200.0.0/16",
        numberOfAvailabilityZones: 2,
        subnets: [
            {type: "public", name: "loadbalancer"},
            {type: "private", name: "instances",},
        ]
    });

    const loadBalancerSecurityGroup = new awsx.ec2.SecurityGroup("loadbalancer", {vpc});

    loadBalancerSecurityGroup.createIngressRule("web-access", {
        location: {cidrBlocks: ["0.0.0.0/0"]},
        ports: new awsx.ec2.TcpPorts(80),
        description: "allow web traffic"
    });
    
    loadBalancerSecurityGroup.createEgressRule("all-access", {
        location: {cidrBlocks: ["0.0.0.0/0"]},
        ports: new awsx.ec2.AllTraffic,
        description: "allow web traffic"
    });

    const ecsInstanceSecurityGroup = new awsx.ec2.SecurityGroup("api-instances", {vpc});

    ecsInstanceSecurityGroup.createIngressRule("all-access", {
        location: {cidrBlocks: ["0.0.0.0/0"]},
        ports: new awsx.ec2.AllTcpPorts(),
        description: "allow web traffic"
    });

    const defaultSubnetGroup = new aws.rds.SubnetGroup("ai-api-subnetgroup-public", {
        subnetIds: vpc.publicSubnetIds,
        tags: {
            Name: "AI API public Subnet Group",
        },
    });

    const privateSubnetGroup = new aws.rds.SubnetGroup("ai-api-subnetgroup-private", {
        subnetIds: vpc.privateSubnetIds,
        tags: {
            Name: "AI API private Subnet Group",
        },
    });

    const cluster = new awsx.ecs.Cluster("cluster", {
        vpc
    });

    const asg = cluster.createAutoScalingGroup("app", {
        templateParameters: {
            minSize: 1,
            maxSize: 5,
            desiredCapacity: 3
        },
        launchConfigurationArgs: {
            instanceType: instanceType,
            securityGroups: [ecsInstanceSecurityGroup.id, cluster.securityGroups[0].id],
            rootBlockDevice: {volumeSize: ebsVolumeSize}
        },
    });

    const alb = new awsx.lb.ApplicationLoadBalancer("lb", {
        securityGroups: [loadBalancerSecurityGroup.id],
        subnets: vpc.publicSubnetIds,
        vpc,
    });

    const httpListener = alb.createListener(`redirecthttp`, {
        port: 80,
        protocol: "HTTP",
        defaultAction: {
            type: "redirect",
            redirect: {
                protocol: "HTTPS",
                port: "443",
                statusCode: "HTTP_301",
            },
        },
    });
    
    const newlistener = alb.createListener(`listener`, {
        port: 443,
        external: true,
        certificateArn: ssmObject.certArn
    });

    apps.forEach((x, i) => {
        let tg = alb.createTargetGroup(`${x.name}tg`, {protocol: 'HTTP', targetType: "ip", port: parseInt(x.port), healthCheck: {path: x.healthCheckPath, port: x.port}});
        
        const listenerRule = new aws.lb.ListenerRule(`${x.name}listenerRule`, {
            actions: [{
                targetGroupArn: tg.targetGroup.arn,
                type: "forward",
            }],
            conditions: [
                {
                    hostHeader: {
                        values: [`${x.name}.${domainName}`],
                    },
                },
            ],
            listenerArn: newlistener.listener.arn
        });


        let appService = new awsx.ecs.EC2Service(`${x.name}appService`, {
            cluster,
            healthCheckGracePeriodSeconds: 60,
            subnets: vpc.privateSubnetIds,
            securityGroups: [ecsInstanceSecurityGroup.id, cluster.securityGroups[0].id],
            taskDefinitionArgs: {
                networkMode: 'awsvpc',
                container: {
                    image: x.ecrUrl,
                    memory: x.containerMemory,
                    cpu: x.containerCPU,
                    portMappings: [{
                        containerPort: parseInt(x.port),
                        hostPort: parseInt(x.port)
                    }]
                }
            },
            desiredCount: x.desiredCountTasks,
            loadBalancers: [{
                containerPort: parseInt(x.port),
                containerName: 'container',
                targetGroupArn: tg.targetGroup.arn
            }],
        });
    });
}

main();