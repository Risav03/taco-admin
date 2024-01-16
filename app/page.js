"use client"

import React from 'react'
import { useState, useEffect } from 'react'
import {ethers} from "ethers";

import Image from "next/image"

import raffleabi from "../utils/raffleAbi"
import erc721abi from "../utils/erc721abi"

const RaffleDashBoard = () => {
  return (
    <div className='w-[90%] mt-32 mx-auto grid grid-cols-4 gap-10 gap-y-10'>
        <RaffleComp number={1}/>
        <RaffleComp number={2}/>
        <RaffleComp number={3}/>
        <RaffleComp number={4}/>
    </div>
  )
}

const RaffleComp = ({number}) => {

  const raffleAdd = "0xdF95f392628711E304b9d4a1bB8eEe6560b8e626";

    const[contractAdd, setContractAdd] = useState("");
    const[tokenId, setTokenId] = useState(null);
    const [limitPerWallet, setLimitPerWallet] = useState(null);
    const [allowedTickets, setAllowedTickets] = useState(null);
    const [guacCost, setGuacCost] = useState(null);

    const [winner, setWinner] = useState("");

    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [ticketsSold, setTicketsSold] = useState(0);
    const [entrants, setEntrants] = useState(0);
    const [itemExists, setItemExists] = useState(false);

    function handleContractAddress(e){
        setContractAdd(e.target.value);
    }

    function handleTokenId(e){
        setTokenId(e.target.value);
    }

    function handleLimitPerWallet(e){
      setLimitPerWallet(e.target.value);
  }

  function handleAllowedTickets(e){
    setAllowedTickets(e.target.value);
}

function handleGuacCost(e){
  setGuacCost(e.target.value);
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

    async function setRaffle(number){
      try{
        const contract = await raffleContract();
        contract.setRaffleItem(number, contractAdd, limitPerWallet, tokenId, allowedTickets, ethers.utils.parseEther(String(guacCost)));
      }
      catch(err){
        console.log(err);
      }
    }

    async function setERC721Contract(){
      try{

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract1 = new ethers.Contract(raffleAdd, raffleabi, signer);
        const address = await contract1?.raffleContract(number);
        console.log(address);
        if(address.toUpperCase() == "0X0000000000000000000000000000000000000000"){
          const contract = new ethers.Contract(contractAdd, erc721abi, signer);
          return contract
        }

        else{
          const contract = new ethers.Contract(address, erc721abi, signer)
          return contract;

        }
      }
      catch(err){
        console.log(err);
      }
    }

    async function deleteRaffle(){
      try{
        const contract = await raffleContract();
        console.log(number);
        contract.deleteRaffle(number);

      }
      catch(err){
        console.log(err);
      }
    }

    async function declareWinner(){
      try{ 
        
        const contract = await raffleContract();

        if(Number(await contract?.totalEntrants(number)) > 0){
  
            const winner = await contract?.declareWinner(number);
            winner.wait().then(async (res)=>{

              setWinner(await contract?.winningAddress(number));
            });  
    
          }
      

        
      }
      catch(err){
        console.log(err);
      }
    }

    async function checkRaffleItem(number){
      try{
        const contract1 = await raffleContract();
        console.log(contract1);

        const limit = Number(await contract1?.ticketLimitPerWallet(number));
        if(limit != 0){
          setItemExists(true);
          
          const contract2 = await setERC721Contract();
          console.log(contract2);
          setWinner(await contract1.winningAddress(number));
          const tokenId = Number(await contract1?.raffleTokenId(number)) ;
          const tokenURI = await contract2.tokenURI(tokenId);

          const metadata = `https://ipfs.io/ipfs/${tokenURI.substr(7)}`;
          const meta = await fetch(metadata);
          const json = await meta.json();
          const name = json["name"];
          const image = json["image"];
          const newimage = `https://ipfs.io/ipfs/${image.substr(7)}`
          console.log(newimage);
          setTicketsSold(Number(await contract1?.ticketsSold(number)));
          setEntrants(Number(await contract1?.totalEntrants(number)));
          setName(name);
          setImage(newimage);
        }

      }
      catch(err){
        console.log(err);
      }
    }


    async function approval(){

        try {
        const contract = await setERC721Contract();
        const approval = await contract?.approve(raffleAdd, tokenId);

        approval.wait();

        await setRaffle(number);


        }
        catch (err) {
        console.log("Error", err)
        //   Swal.fire({
        //     title: 'Error!',
        //     text: 'Couldn\'t get fetching contract',
        //     imageUrl: error,
        //     imageWidth: 200,
        //     imageHeight: 200,
        //     imageAlt: "Taco OOPS!",
        //     confirmButtonText: 'Bruh 😭',
        //     confirmButtonColor: "#facc14",
        //     customClass: {
        //       container: "border-8 border-black",
        //       popup: "bg-white rounded-2xl border-8 border-black",
        //       image: "-mb-5",
        //       confirmButton: "w-40 text-black"
        //     }
        //   })
        }

    }

    useEffect(()=>{
      checkRaffleItem(number);
    },[])


    return(
        <div className="">
            <h1 className='text-white text-2xl font-bold py-2 bg-red-500 px-6 rounded-t-xl w-fit mx-auto border-b-0 border-black border-2'>RAFFLE - {number}</h1>
            <div className='  bg-yellow-400 border-2 border-black rounded-xl p-5 w-full flex flex-col items-center justify-center '>


          {itemExists ?<div className='w-[100%] text-center'>

            <Image width={1920} height={1080} className='w-[90%] mb-4 rounded-xl mx-auto' alt='Raffle Item' src={image}></Image>
            <h2 className='text-black text-3xl'>{name}</h2>
            <div>
              <h2>Entrants: {entrants} </h2>
              <h2>Tickets Sold: {ticketsSold}</h2>
              <h2 className='text-sm'>{winner}</h2>
              <button onClick={declareWinner} className='bg-blue-400 mx-2 text-white py-2 px-4 rounded-xl border-2 border-black my-2 text-[1.5rem]'>Declare Winner!</button>
              <button onClick={deleteRaffle} className='bg-red-400 mx-2 text-white py-2 px-4 rounded-xl border-2 border-black my-2 text-[1.5rem]'>Delete Raffle</button>
            </div>

          </div> :  <div>
            
              <div className='flex flex-wrap flex-row items-center w-full gap-5'>
                  <div className='w-full'>
                      <h3 className='text-black text-base font-bold'>Contract Add.</h3>
                      <input onChange={handleContractAddress} value={contractAdd} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                  </div>

                  <div className='w-full'>
                      <h3 className='text-black text-base font-bold'>TokenID</h3>
                      <input onChange={handleTokenId} value={tokenId} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                  </div>

                  <div className='w-full'>
                      <h3 className='text-black text-base font-bold'>Limit Per Wallet</h3>
                      <input onChange={handleLimitPerWallet} value={limitPerWallet} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                  </div>

                  <div className='w-full'>
                      <h3 className='text-black text-base font-bold'>Total Allowed Tickets</h3>
                      <input onChange={handleAllowedTickets} value={allowedTickets} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                  </div>

                  <div className='w-full'>
                      <h3 className='text-black text-base font-bold'>$GUAC Cost per Ticket</h3>
                      <input onChange={handleGuacCost} value={guacCost} type="text" className='px-4 h-12 w-full rounded-lg bg-white text-lg border-2 border-black' />
                  </div>
              </div>
              <button onClick={()=>{
                
                  approval();
              }} className=' mt-5 font-bold hover transition-all scale-110 duration-300 cursor-pointer bg-lime-600 text-white px-4 py-2 rounded-full mx-auto border-2 border-black '>Set Raffle</button>
              
          </div>}
            </div>
{}
        </div>
    )
}

export default RaffleDashBoard;