import db_services from './db_services';
import services from './services';
import channel from './channels';
import { S3Utilities } from './utils/S3Utilities/S3Utilities';

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: any): void {
    app.configure(db_services);
    app.configure(services);
    app.configure(channel);
    app.configure(S3Utilities.initializeAWS);
}
