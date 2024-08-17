class ApiResponse {
    constructor(
        status,
        data,
        message = "success",
        success = status < 400
    ) {
        this.status = status
        this.data = data
        this.message = message
        this.success = success
    }
}

export { ApiResponse }