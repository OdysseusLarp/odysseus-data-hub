#!/bin/bash

BUCKET="odysseus-larp-dev"
REGION="eu-west-1"
PACKAGE_NAME="socialhub_${CIRCLE_BUILD_NUM}.tar.gz"
APPLICATION_NAME="odysseus-social-hub"
DEPLOYMENT_GROUP="odysseus-social-hub-dev"

echo "Creating package ${PACKAGE_NAME}"
cp appspec.yml dist/ && \
	cd dist && \
	tar czf ${PACKAGE_NAME} odysseus-social-hub appspec.yml

echo "Saving ${PACKAGE_NAME} to S3"
aws s3 cp ${PACKAGE_NAME} s3://${BUCKET}/${PACKAGE_NAME} --region $REGION

echo "Deploying using CodeDeploy"
DEPLOYMENT=`aws deploy create-deployment \
	--application-name ${APPLICATION_NAME} \
	--deployment-group ${DEPLOYMENT_GROUP} \
	--s3-location bucket=${BUCKET},bundleType=tgz,key=${PACKAGE_NAME} \
	--region ${REGION} \
	--query deploymentId \
	--output text`

echo "Waiting for deployment to finish"
aws deploy wait deployment-successful --deployment-id ${DEPLOYMENT} --region ${REGION}

echo "Deployment finished"
exit 0
