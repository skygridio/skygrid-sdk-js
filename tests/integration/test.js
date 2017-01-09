/*import projectTest from './rest/Project';
import userTest from './rest/User';
import schemaTest from './rest/Schema';
import deviceTest from './rest/Device';*/

import SkyGrid from '../../lib/SkyGrid.js';
import chai from 'chai';
const expect = chai.expect;

const TEST_SERVER_ADDRESS = 'http://localhost:80';
const TEST_PROJECT_ID = '311t6HJC';

function runProtocolTests(protocol, address, projectId) {
	const state = {
		protocol: protocol,
		address: address,
		projectId: projectId,

		project: null
	};

	describe(`(${protocol})`, () => {
		before(() => {
			state.project = SkyGrid.project(projectId, {
				address: address,
				api: protocol
			});

			console.log('proj', state.project);
		});

		describe('project', () => {
			it('should be fetchable', () => {
				return state.project.fetch().then(project => {
					expect(project).to.be.a('object');
					expect(project.isComplete).to.equal(true);
					expect(project.name).to.equal('Test Project');
					expect(project.allowSignup).to.equal(true);
					expect(project.acl).to.be.a('object');
					expect(project.acl.isEmpty).to.equal(false);
				});
			});

			it('should not allow changes when not logged in as master', () => {
				state.project.name = 'Test Project Edited';
				return state.project.save().then(() => {
					
				});
			});

			it('should allow logging in with master key', () => {
				return state.project.loginMaster('NbfsUkvYvK8oPeGODJianMoA');
			});
		});

		after(() => {
			return state.project.close();
		});
	});
}

export default function run() {
	describe('SkyGrid', () => {
		runProtocolTests('rest', TEST_SERVER_ADDRESS, TEST_PROJECT_ID);
		//runProtocolTests('websocket', TEST_SERVER_ADDRESS, TEST_PROJECT_ID);
		//runProtocolTests('socketio', TEST_SERVER_ADDRESS, TEST_PROJECT_ID);
	});
}