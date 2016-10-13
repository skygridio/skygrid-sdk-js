/*import Project from './Project';

export default class SkyGrid {
	static project(projectId, settings) {
		return new Project(projectId, settings);
	}
}*/

var Project = require('./project');

exports.project = function(projectId, settings) {
	return new Project.default(projectId, settings);
};