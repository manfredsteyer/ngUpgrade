"use strict";
import { extend } from "../common/common";
import { services } from "../common/coreservices";
export var RejectType;
(function (RejectType) {
    RejectType[RejectType["SUPERSEDED"] = 2] = "SUPERSEDED";
    RejectType[RejectType["ABORTED"] = 3] = "ABORTED";
    RejectType[RejectType["INVALID"] = 4] = "INVALID";
    RejectType[RejectType["IGNORED"] = 5] = "IGNORED";
})(RejectType || (RejectType = {}));
export class TransitionRejection {
    constructor(type, message, detail) {
        extend(this, {
            type: type,
            message: message,
            detail: detail
        });
    }
    toString() {
        const detailString = d => d && d.toString !== Object.prototype.toString ? d.toString() : JSON.stringify(d);
        let type = this.type, message = this.message, detail = detailString(this.detail);
        return `TransitionRejection(type: ${type}, message: ${message}, detail: ${detail})`;
    }
}
export class RejectFactory {
    constructor() {
    }
    superseded(detail, options) {
        let message = "The transition has been superseded by a different transition (see detail).";
        let reason = new TransitionRejection(RejectType.SUPERSEDED, message, detail);
        if (options && options.redirected) {
            reason.redirected = true;
        }
        return extend(services.$q.reject(reason), { reason: reason });
    }
    redirected(detail) {
        return this.superseded(detail, { redirected: true });
    }
    invalid(detail) {
        let message = "This transition is invalid (see detail)";
        let reason = new TransitionRejection(RejectType.INVALID, message, detail);
        return extend(services.$q.reject(reason), { reason: reason });
    }
    ignored(detail) {
        let message = "The transition was ignored.";
        let reason = new TransitionRejection(RejectType.IGNORED, message, detail);
        return extend(services.$q.reject(reason), { reason: reason });
    }
    aborted(detail) {
        let message = "The transition has been aborted.";
        let reason = new TransitionRejection(RejectType.ABORTED, message, detail);
        return extend(services.$q.reject(reason), { reason: reason });
    }
}
//# sourceMappingURL=rejectFactory.js.map