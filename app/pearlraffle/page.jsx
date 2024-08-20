"use client"

import React from 'react'
import { useState, useEffect } from 'react'
import {ethers} from "ethers";
import { InfinitySpin } from 'react-loader-spinner';
import Image from "next/image"
import axios from 'axios';

import raffleabi from "../../utils/pearlRaffle"
import erc721abi from "../../utils/erc721abi"

import { useAccount } from 'wagmi';


const RaffleDashBoard = () => {

  const {address} = useAccount()

  const raffleAdd = "0x0059C6C24D363a063002754a4A8f2217D29B453F";

  const[owner, setOwner] = useState("");
  const [raffles, setRaffles] = useState([])

  const [loading, setLoading] = useState(false);

  const[activeRaffles, setActiveRaffles] = useState(0);
  const [limitPerWallet, setLimitPerWallet] = useState(null);
  const [allowedTickets, setAllowedTickets] = useState(null);
  const [pearlCost, setPearlCost] = useState(null);


  async function setERC721Contract(){
    try{

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

        const contract = new ethers.Contract(link.split("/")[link.split("/").length-2], erc721abi, signer);
        return contract
      
    }
    catch(err){
      console.log(err);
    }
  }

  const [link, setLink] = useState("");

  const[profileImg, setProfileImg] = useState(null)

    const handleFileChange = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
          setProfileImg(e.target.files[0]);
      }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {

        const formData = new FormData();

        if(profileImg){
          const shit = link.split("/")[link.split("/").length-2]+link.split("/")[link.split("/").length-1]
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

  async function setRaffle(){
    const contract = await raffleContract();

    const contractAdd = link.split("/")[link.split("/").length-2];
    const tokenId = link.split("/")[link.split("/").length-1];

    const txn = await contract.setRaffleItem(activeRaffles, contractAdd, limitPerWallet, link, tokenId, allowedTickets, ethers.utils.parseEther(pearlCost));

    txn.wait().then((res)=>{
      setLoading(false);
      window.location.reload()
    })
  }

    async function approval(){

        try {
        const contract = await setERC721Contract();
        const tokenId = link.split("/")[link.split("/").length-1];

        const approval = await contract?.approve(raffleAdd, tokenId);

        approval.wait().then((res)=>{
          setRaffle();
        });

        }
        catch (err) {
        console.log("Error", err)
        setLoading(false);
        
        }

    }


  async function raffleContract(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    try {
    const contract = new ethers.Contract(raffleAdd, raffleabi, signer);
    console.log("raffle", raffleAdd);
    return contract;
    }
    catch(err){
      console.log(err);
    }
  }

  async function fetchRaffles(){
    try{
      const contract = await raffleContract();
      const response = await contract.fetchActiveRaffles();

      console.log(response);

      response.forEach((item, i) => {
        const shit = item[0].toLowerCase()+item[1];
        console.log(shit);
        const image = "https://tacotribe.s3.ap-south-1.amazonaws.com/raffles/"+shit;

        console.log(image);
        
        setRaffles((prev) => [...prev, [...item, image, i]]);
      });

      const active = await contract.activeRaffles();

      setActiveRaffles(active)

      // setRaffles(response);

      console.log(response);
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    fetchRaffles()
  },[address])

  async function setRaffleOwner(){
    try{
      const contract = await raffleContract();
      const txn = await contract.transferOwnership(owner);

      txn.wait().then(async(res)=>{
        window.location.reload();
    })
    }
    catch(err){
      console.log(err);
    }
  }

  async function raffleContract(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  
    const signer = provider.getSigner();
  
    try {
    const contract = new ethers.Contract(raffleAdd, raffleabi, signer);
    console.log("raffle", raffleAdd);
    return contract;
    }
    catch(err){
      console.log(err);
    }
  }

  async function changeOwner(){
    try{
      
        setRaffleOwner();
      
    }
    catch(err){
      console.log(err);
    }
  }

  function handleOwner(e){
    setOwner(e.target.value);
}

  return (
    <div className='w-[90%] mt-20 min-[1600px]:mt-32 mx-auto min-[1600px]:gap-10'>
        <div className='flex flex-wrap gap-2 items-center justify-center'>
          {raffles.slice(0, raffles.length).map((item)=>(
            <RaffleComp data={item} />
          ))}
          <div className='bg-purple-400 border-4 border-black rounded-xl p-10'>
            <div className='flex flex-col justify-center items-center w-full gap-5'>

                <div className='w-full'>
                    <h3 className='text-black text-base font-bold'>Limit Per Wallet</h3>
                    <input onChange={(e)=>{setLimitPerWallet(e.target.value)}} value={limitPerWallet} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                </div>

                <div className='w-full'>
                    <h3 className='text-black text-base font-bold'>Total Allowed Tickets</h3>
                    <input onChange={(e)=>{setAllowedTickets(e.target.value)}} value={allowedTickets} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                </div>

                <div className='w-full'>
                    <h3 className='text-black text-base font-bold'>$PEARL Cost per Ticket</h3>
                    <input onChange={(e)=>{setPearlCost(e.target.value)}} value={pearlCost} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                </div>

                <div className='w-full'>
                    <h3 className='text-black text-base font-bold'>NFT Opensea Link</h3>
                    <input onChange={(e)=>{setLink(e.target.value)}} value={link} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
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
            </div>
            {loading ? <InfinitySpin className="mx-auto" visible={true} width="200" color="#ffffff" ariaLabel="infinity-spin-loading" /> :  <button onClick={handleSubmit} className=' mt-5 font-bold hover transition-all flex items-center justify-center duration-300 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full mx-auto border-2 border-black '>Set Raffle</button>}
        </div>
        </div>
        <div className='w-full'>
            <h3 className='text-black text-lg font-bold'>Reset Ownership</h3>
            <input onChange={handleOwner} value={owner} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
            <button onClick={changeOwner} className="bg-red-500 text-white border-2 border-black rounded-2xl px-4 py-3 mt-2">Change</button>
        </div>
    </div>
  )
}

const RaffleComp = ({data}) => {
  const {address} = useAccount();
  const raffleAdd = "0x0059C6C24D363a063002754a4A8f2217D29B453F";

  const[contractAdd, setContractAdd] = useState("");
  const[tokenId, setTokenId] = useState(null);
  const [limitPerWallet, setLimitPerWallet] = useState(null);
  const [allowedTickets, setAllowedTickets] = useState(null);
  const [pearlCost, setPearlCost] = useState("");

  const [winner, setWinner] = useState("");
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [ticketsSold, setTicketsSold] = useState(0);
  const [entrants, setEntrants] = useState(0);

  const [link, setLink] = useState("");

  useEffect(()=>{
    setContractAdd(data[0]);
    setTokenId(Number(data[1]));
    setEntrants(Number(data[2]));
    setTicketsSold(Number(data[3]));
    setAllowedTickets(Number(data[4]));
    setLimitPerWallet(Number(data[6]));
    setPearlCost(String(ethers.utils.formatEther(String(data[7]))))
    setLink(data[8])
    setImage(data[10]);

    setId(data[11]);
    // setImage(data[9])
  },[])

    async function raffleContract(){
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();

      try {
      const contract = new ethers.Contract(raffleAdd, raffleabi, signer);
      // console.log("raffle", raffleAdd);
      return contract;
      }
      catch(err){
        console.log(err);
      }
    }

    async function deleteRaffle(){
      try{
        const contract = await raffleContract();
        console.log(id);
        await contract.deleteRaffle(id);

      }
      catch(err){
        console.log(err);
      }
    }

    async function declareWinner(){
      try{ 
        
        const contract = await raffleContract();
        
        await contract?.declareWinner(id);
        
      }
      catch(err){
        console.log(err);
      }
    }


    return(
        <div className="">
            <div className=' bg-purple-400 border-4 border-black rounded-xl p-2 w-full flex flex-col items-center justify-center '>

          <div className='w-[100%] text-center'>

            <Image width={1920} height={1080} className='w-64 mb-4 rounded-xl mx-auto' alt='Raffle Item' src={image}></Image>
            <h2 className='text-black text-3xl'>{name}</h2>
            <div className='flex flex-col gap-2'>
              <h2>Entrants: {entrants} </h2>
              <h2>Tickets Sold: {ticketsSold}/{allowedTickets}</h2>
              <h2 className='text-sm font-semibold truncate'>Winner: {winner}</h2>
              <h2 className='text-sm font-semibold truncate'>Limit Per Wallet: {limitPerWallet}</h2>
              <h2 className='text-sm font-semibold truncate'>Pearl Cost: {pearlCost} $PEARL </h2>

              <a href={link} target='_blank' className='text-blue-500 font-bold' >Opensea</a>
              <div className='flex gap-1 items-center justify-center'>
                <button onClick={declareWinner} className='bg-blue-400 hover:-translate-y-1 duration-200 font-bold mx-2 text-white py-2 px-4 rounded-xl border-2 border-black my-2 text-[1rem]'>Winner</button>
                <button onClick={()=>{ deleteRaffle()}} className='bg-red-400 hover:-translate-y-1 duration-200 font-bold mx-2 text-white py-2 px-4 rounded-xl border-2 border-black my-2 text-[1rem]'>Delete</button>
              </div>
            </div>

          </div>  
            </div>

        </div>
    )
}

export default RaffleDashBoard;