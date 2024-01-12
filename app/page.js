"use client"

import React from 'react'
import { useState, useEffect } from 'react'
import {ethers} from "ethers";

import raffleabi from "../utils/raffleAbi"
import erc721abi from "../utils/erc721abi"

const RaffleDashBoard = () => {
  return (
    <div className='w-[80%] mt-20 mx-auto grid grid-cols-2 gap-5 gap-y-10'>
        <RaffleComp number={1}/>
        <RaffleComp number={2}/>
        <RaffleComp number={3}/>
        <RaffleComp number={4}/>
    </div>
  )
}

const RaffleComp = ({number}) => {

  const raffleAdd = "0xC1150EF9d26d6686bA8e90340171662955d82493";

    const[contractAdd, setContractAdd] = useState("");
    const[tokenId, setTokenId] = useState(null);
    const [limitPerWallet, setLimitPerWallet] = useState(null);
    const [allowedTickets, setAllowedTickets] = useState(null);
    const [guacCost, setGuacCost] = useState(null);

    const [name, setName] = useState("");
    const [image, setImage] = useState("");

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
      return contract;
      }
      catch(err){
        console.log(err);
      }
    }

    async function setRaffle(number){
      try{
        const contract = await raffleContract();
        contract.setRaffleItem(number, contractAdd, limitPerWallet, tokenId, allowedTickets, guacCost);
      }
      catch(err){
        console.log(err);
      }
    }

    async function setERC721Contract(){
      try{
        let abi = erc721abi;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAdd, abi, signer);

        return contract;
      }
      catch(err){
        console.log(err);
      }
    }

    async function checkRaffleItem(number){
      try{
        const contract1 = await raffleContract();
        console.log(number);
        const limit = Number(await contract1?.ticketLimitPerWallet(number));
        if(limit != 0){
          setItemExists(true);
          const contract2 = await setERC721Contract();
          const tokenId = Number(await contract1?.raffleTokenId(number)) ;
          const tokenURI = await contract2.tokenURI(tokenId);

          const metadata = `https://ipfs.io/ipfs/${tokenURI.substr(7)}`;
          const meta = await fetch(metadata);
          const json = await meta.json();
          const name = json["name"];
          const image = json["image"];
          const newimage = `https://ipfs.io/ipfs/${image.substr(7)}`

          setName(name);
          setImage(newimage);
        }

      }
      catch(err){
        console.log(err);
      }
    }


    async function approval(number){

        try {
        const contract = await setERC721Contract();
        const approval = await contract?.approve("0x3Dc1642f53EE8546D2908ecD0D6A31e961f71E3D", tokenId);

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
        <div className=' '>
            <h1 className='text-white text-2xl font-bold py-2 bg-red-500 px-6 rounded-t-xl w-fit mx-auto border-b-0 border-black border-2'>RAFFLE - {number}</h1>
            <div className='  bg-yellow-400 border-2 border-black rounded-xl p-5 w-full flex flex-col items-center justify-center '>
          {itemExists ?<div>

            <h1>{name}</h1>
            <Image width={1920} height={1080} src={image}/>

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
                  console.log("contract:", contractAdd);
                  console.log("tokenID:", tokenId);
                  approval(number);
              }} className=' mt-5 font-bold hover transition-all scale-110 duration-300 cursor-pointer bg-lime-600 text-white px-4 py-2 rounded-full mx-auto border-2 border-black '>Set Raffle</button>
              
          </div>}
            </div>
{}
        </div>
    )
}

export default RaffleDashBoard;