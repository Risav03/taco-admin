"use client"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "../Buttons/walletConnectButton"

export default function Navbar(){

    const router = useRouter();

    return(
        <div className="flex flex-row justify-between w-[80%] mx-auto mt-2">
           <button onClick={()=>{router.push("/minimart")}} className="px-4 py-1 rounded-full border-2 border-black bg-yellow-400 text-black">Minimart</button>
            <WalletConnectButton/>
        </div>
    )
}