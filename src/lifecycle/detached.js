import apiEmit from '../api/emit';
import data from '../util/data';
import registry from '../global/registry';
import walkTree from '../util/walk-tree';

function callDetachedOnDescendants (elem, id) {
  walkTree(elem.childNodes, function (child) {
    registry.find(child).forEach(Ctor => Ctor.prototype.detachedCallback.call(child));
  }, function (child) {
    return !data(child, id).detached;
  });
}

export default function (opts) {
  var unready = apiEmit('_skate-unready', { detail: opts })

  /* jshint expr: true */
  return function () {
    var info = data(this, opts.id);
    var isNative = this.detachedCallback;

    if (info.detached) {
      return;
    }

    info.detached = true;
    opts.detached.call(this);
    isNative || callDetachedOnDescendants(this, opts.id);
    unready.call(this);
    info.attached = false;
  };
}
