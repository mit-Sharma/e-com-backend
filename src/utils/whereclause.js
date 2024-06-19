class whereclause{
    constructor(base,bigQ)
    {
        this.base=base;
        this.bigQ=bigQ;
    }

    search()
    {
        const searchWord=this.bigQ.search?{
            name:{
                $regex:this.bigQ.search,
                $options:'i'
            }
        }:{}

        console.log("SearchWord"+searchWord)
        this.base=this.base.find({...searchWord})
        return this;
    }

    filter()
    {
        const copyQ={...this.bigQ}
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];
        let stringofCopyQ=JSON.stringify(copyQ)
        stringofCopyQ=stringofCopyQ.replace(/\b(gt|gte|lt|lte)\b/g,m=>`$${m}`)
        copyQ=JSON.parse(stringofCopyQ)
        this.base=this.base.find(copyQ)
        return this;
    }

    pager(resultperPage)
    {
        let currentPage=1;
        if(this.bigQ.page){
            currentPage=this.bigQ.page
    }
    const skipValue=resultperPage*(currentPage-1);
    this.base=this.base.limit(resultperPage).skip(skipValue)
    return this;
}
}
export {whereclause}