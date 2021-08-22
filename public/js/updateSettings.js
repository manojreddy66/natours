import axios from 'axios';
import catchAsync from '../../utils/catchAsync';
import { showAlert } from './alerts';


export const updateSettings=async(data,type)=>{
    try{
        const url=type==='password'?'/api/v1/users/updatePassword':'/api/v1/users/updateMe'
        const res=await axios({
            method:'PATCH',
            url,
            data
        });
        console.log(res);
        // console.log(res.data.status)
        if(res.data.status==='sucess')
            showAlert('success', `${type.toUpperCase()}updated successfully`)
        
    }catch(err){
    showAlert('error',err.response.data.message)
    }
    


};