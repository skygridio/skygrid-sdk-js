var Project = require('./Project');

exports.project = function(projectId, settings) {
	return new Project.default(projectId, settings);
};