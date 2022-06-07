let pageData={ 
    members:[
              {
                name:'Susan',
                gender:'Female'
            },
            {
                name:'Peter',
                gender:'Male'
            },
            {
                name:'Bill',
                gender:'Unknown'
            }]
};
const app= Vue.createApp({
    data(){
        return pageData;
    }
});
app.mount("#app");