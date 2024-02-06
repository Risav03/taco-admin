"use client"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "../Buttons/walletConnectButton"

export default function Navbar(){

    const router = useRouter();

    return(
        <div className="flex px-24 py-5 gap-20 mb-10">

        <div className="flex flex-row justify-between w-fit gap-5  mt-2">
           <button onClick={()=>{router.push("/minimart")}} className="px-4 py-1 hover:bg-yellow-500 rounded-full border-2 border-black bg-yellow-400 text-black">Minimart</button>
           <button onClick={()=>{router.push("/")}} className="px-4 py-1 hover:bg-yellow-500 rounded-full border-2 border-black bg-yellow-400 text-black">Raffle</button>
        </div>
            <WalletConnectButton/>
        </div>
    )
}