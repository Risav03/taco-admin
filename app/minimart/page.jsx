"use client"

import React from 'react'
import { useState, useEffect } from 'react'
import {ethers} from "ethers";
import erc721abi from '@/utils/erc721abi';
import Image from "next/image"
import Swal from"sweetalert2"
import minimartabi from '@/utils/minimartabi';
import axios from 'axios';

const MinmartDashboard = () => {

  const[contractAdd, setContractAdd] = useState("");
  const[tokenId, setTokenId] = useState(null);

  const[price, setPrice] = useState(null);
  const [displayNFT, setDisplayNFT] = useState([]);
  const[loading, setLoading] = useState(false);
  // const[errorNFTs, setErrorNFTs] = useState([]);
  const[profileImg, setProfileImg] = useState(null)


  const address = "0x9c998aE8f5D156B54163990DDcfE97da242A499B"

  async function minimartContractSetup() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const contract = new ethers.Contract(address, minimartabi, signer);
      return contract;
    }
    catch (err) {


      console.log("Error", err)
      Swal.fire({
        title: 'Error!',
        text: 'Couldn\'t get fetching contract',
        imageUrl: error,
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: "Taco OOPS!",
        confirmButtonText: 'Bruh 😭',
        confirmButtonColor: "#facc14",
        customClass: {
          container: "border-8 border-black",
          popup: "bg-white rounded-2xl border-8 border-black",
          image: "-mb-5",
          confirmButton: "w-40 text-black"
        }
      })
    }
  }
  async function setMinimartItem() {
    try {
      const contract = await minimartContractSetup();
      const txn = await contract.setMinimartItem(contractAdd, tokenId, ethers.utils.parseEther(String(price)));
      txn.wait().then(() => {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "NFT has been listed for " + String(price) + " $GUAC",
          showConfirmButton: false,
          timer: 1500
        }).then((res) => { window.location.reload() });
      });

    }
    catch (err) {
      setLoading(false);
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {

        const formData = new FormData();

        
        if(profileImg){
          const shit = contractAdd+tokenId
          formData.append("profileImage", profileImg);
          formData.append("index", shit);
        }


        const response = await axios.post('/api/imageUpload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.status !== 200) {
            console.log("error");
            return;
        }

        // Reset form fields
        if(response.status == 200){
            approval();
        }

        // alert("Collection created successfully!");
    } catch (error) {
      setLoading(false);
        console.log(error);
    }
}

  async function setERC721(contractAdd) {
    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      if (contractAdd.toUpperCase() != "0X0000000000000000000000000000000000000000") {
        const contract = new ethers.Contract(contractAdd, erc721abi, signer);
        return contract
      }

    }
    catch (err) {
      console.log(err);
    }
  }

  async function setERC721Contract(){
    try{

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAdd, erc721abi, signer);
        return contract
      }

    
    catch(err){
      console.log(err);
    }
  }

  async function displayListedNFTs() {
    try {
      // const contract = await setERC721Contract();

      
      const minimartContract = await minimartContractSetup();
      
      const data = await minimartContract.fetchData();

      console.log(data);
      
      for (let i = 0; i < data.length; i++) {
        
        const contract = await setERC721(data[i][0]);
        
        const contractAdd = data[i][0];
        
       
        if (contractAdd.toUpperCase() != "0X0000000000000000000000000000000000000000") {
          console.log("helloooooo", contractAdd);
          const tokenId = String(data[i][1]);
          const nameFirst = await contract.name();
          


          try{
            

            const name = nameFirst+ " #"+tokenId;
            const img = "https://tacotribe.s3.ap-south-1.amazonaws.com/raffles/"+contractAdd.toLowerCase()+tokenId;
            console.log(img);
            const price = ethers.utils.formatEther(String(data[i][3]));
            const owner = String(data[i][2]);
  
            setDisplayNFT(oldArray =>[...oldArray, { name, tokenId, img, price, owner, i }]);
          }
          catch(err){
            console.log(err);
            // setErrorNFTs(oldArray=>[...oldArray,{tokenId, contractAdd, i}]);
          }


          
        }
      }


    }
    catch(err){
      console.log(err);
    }
  }

  async function approval(){

    try {
      setLoading(true);
    const contract = await setERC721Contract();
    const approval = await contract?.approve(address, tokenId);

    approval.wait().then((res)=>{
      setMinimartItem()
    });



    }
    catch (err) {
    console.log("Error", err);
    setLoading(false);
      Swal.fire({
        title: 'Error!',
        text: 'Couldn\'t get fetching contract',
        imageUrl: error,
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: "Taco OOPS!",
        confirmButtonText: 'Bruh 😭',
        confirmButtonColor: "#facc14",
        customClass: {
          container: "border-8 border-black",
          popup: "bg-white rounded-2xl border-8 border-black",
          image: "-mb-5",
          confirmButton: "w-40 text-black"
        }
      })
    }

}

  function handleContractAddress(e){
    setContractAdd(e.target.value);
}

function handleTokenId(e){
    setTokenId(e.target.value);
}

function handlePrice(e){
  setPrice(e.target.value);
}
async function unList(item) {
  try {
    setLoading(true);
    const contract = await minimartContractSetup();
    const resp = await contract.unListItem(item);

    resp.wait().then(() => {
      console.log(resp)
      Swal.fire({
        icon: "success",
        title: "Item Unlisted",
        showConfirmButton: false,
        timer: 1500
      }).then((res) => { window.location.reload() }); setLoading(false);
    });
  }
  catch (err) {
    setLoading(false);
    console.log(err);
    Swal.fire({
      icon: "error",
      title: "Couldn't Unlist Marketplace Items",
      showConfirmButton: false,
      timer: 1500
    });
  }
}

const handleFileChange = async (e) => {
  if (e.target.files && e.target.files.length > 0) {
      setProfileImg(e.target.files[0]);
  }
};

useEffect(()=>{
  displayListedNFTs()
},[])

  return (
    <div className='w-[80%] mt-20 mx-auto'>
      <div className='mx-auto'>

        <h1 className="font-bold text-4xl mb-10 text-center">Set Item:</h1>
        <div className='border-4 w-[50%] border-black bg-yellow-400 rounded-2xl p-5 flex flex-col gap-5 mx-auto'>
          
          <div>
            <h1 className='font-bold'>Contract Address:</h1>
            <input onChange={handleContractAddress} value={contractAdd} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
          </div>

          <div className='font-bold'>
            <h1>Token ID:</h1>
            <input onChange={handleTokenId} value={tokenId} type="number" min={0} className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
          </div>

          <div className='font-bold'>
            <h1>Price:</h1>
            <input onChange={handlePrice} value={price} type="number" min={0} className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
          </div>

          <div>
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-48 h-48 border-2 border-jel-gray-3 border-dashed rounded-full cursor-pointer hover:bg-jel-gray-1">
                          <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                              {!profileImg ? <svg className="w-8 h-8 text-jel-gray-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                              </svg> :
                                  <Image alt="hello" className='w-full h-full object-cover rounded-full hover:scale-110 hover:opacity-30 duration-300' width={1000} height={1000} src={!profileImg ? "" : (profileImg instanceof File ? URL.createObjectURL(profileImg) : profileImg)} />}
                          </div>
                          <input id="dropzone-file" type="file" accept='image/*' onChange={handleFileChange} className="hidden" />
                      </label>
                  </div>

          <button onClick={handleSubmit} className={`bg-green-500 border-2 border-black hover:bg-green-600 ${loading && "animate-spin"} duration-300 rounded-2xl px-6 py-3 text-3xl mx-auto font-bold`}>List</button>
      </div>


       </div>

       {/* <div className='text-center text-3xl font-bold my-10'>
        <h1>Faulty Lists: </h1>
        <div className='flex flex-row flex-wrap mx-auto item-center justify-center'>

          {errorNFTs.map((item)=>(
            <div className='bg-red-400 p-4 rounded-3xl m-4 text-white w-[40%]'>
              <h2 className='truncate'>{item.contractAdd}</h2>
              <h2 className='text-2xl font-medium'>{item.tokenId}</h2>
              <button disabled={loading} onClick={() => { unList(item.i) }} className={`bg-red-500 py-2 text-2xl ${loading && " animate-spin "} px-5 my-3 rounded-2xl border-2 border-black hover:bg-red-600`}>Unlist</button> 
              </div>
          ))}
        </div>
       </div> */}

       <div className='mt-10'>
       <h1 className="font-bold text-4xl mb-10 text-center ">Currently Listed:</h1>
       <div className="flex gap-5 flex-wrap text-center">
       {displayNFT.map((item) => (
            <div className="mx-auto">
              <Image width={1920} height={1080} src={item.img} className="shadow-xl bg-white shadow-black/30 w-52 h-52 mx-auto rounded-2xl relative z-[2] border-2 border-black" />
              <div className="bg-red-400 w-60 px-5 -translate-y-24 shadow-2xl shadow-black/60 pt-28 border-4 border-black rounded-2xl">
                <h1 className="text-black text-lg">{item.name}</h1>
                <h1 className="text-black bg-yellow-400 border-2 py-2 rounded-2xl border-black">{item.price} $GUAC</h1>
                <button disabled={loading} onClick={() => { unList(item.i) }} className={`bg-red-500 py-2 text-2xl ${loading && " animate-spin "} px-5 my-3 rounded-2xl border-2 border-black hover:bg-red-600`}>Unlist</button> 
              </div>
                </div>
          ))}
          </div>
       </div>
    </div>
  )
}



export default MinmartDashboard