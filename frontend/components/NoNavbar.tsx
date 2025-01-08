import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center m-8 h-14 fixed bg-[#00040a] rounded-xl">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        <span className="text-lg font-semibold text-foreground">FlashAI<span className='text-red-500'>.</span></span>
      </div>
    </nav>
  )
}