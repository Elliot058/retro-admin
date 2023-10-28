import { Application } from '../../../../declarations';

import docs from './docs/docs.service';
import links from './links/links.service';
import media from './media/media.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
    app.configure(docs);
    app.configure(links);
    app.configure(media);
}
