import 'dotenv/config'
import app from "./src/app.js";


const PORT=process.env.PORT || 6000;

async function main(){
try { 

app.listen(PORT,()=>{
    console.log(`Server running on :http://localhost:${PORT}`);
})
} catch (error) {
    console.log('Fail to start Server',error);
}
}
main()
