// This is just a hack to get the proper host value as it is not currently auto generated properly
// from api docs, this should be fixed and then this file and replace config can be removed from
// angular.json

const spec: api.OpenApiSpec = {
	host: 'apps.odysseuslarp.dev',
	schemes: ['https'],
	basePath: '',
	contentTypes: [],
	accepts: ['application/json'],
	securityDefinitions: {},
};
export default spec;
