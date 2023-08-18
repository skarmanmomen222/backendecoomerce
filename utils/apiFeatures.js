
class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }

    // search 
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i"
            }
        } : {}
        this.query = this.query.find({ ...keyword })
        return this
    }

    // filter 
    filter() {
        let queryCopy = { ...this.queryStr }
        const removefields = ["keyword", "limit", "page"]

  
        removefields.forEach((key) => delete queryCopy[key])

        // price filtering
        let querystr = JSON.stringify(queryCopy)
         

        querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
        console.log(querystr)

        this.query = this.query.find(JSON.parse(querystr))
        return this

    }

    // pagination
    pagination(resultPerPage) {
        const currentpage = Number(this.queryStr.page) || 1
        const skip = resultPerPage * (currentpage - 1)
        console.log(skip)
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this
    }
}
module.exports = ApiFeatures