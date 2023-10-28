import { Application } from '../declarations';
import user from './user/user.service';
import upload from './upload/upload.service'
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(user);
  app.configure(upload);
}
