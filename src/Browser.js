require('es6-promise');

import SkyGrid from './SkyGrid';
import SkyGridError from './SkyGridError';
import Acl from './Acl';
global.SkyGrid = SkyGrid;
global.Acl = Acl;
global.SkyGridError = SkyGridError;