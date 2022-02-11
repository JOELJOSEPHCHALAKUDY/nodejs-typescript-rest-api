export class HttpError extends Error {
    status: number;
    errors: any;

    constructor(_message: string, _status: number, _errors?: any) {
        super(_message);
        this.status = _status || 500;
        this.errors = _errors || {};
    }
};
