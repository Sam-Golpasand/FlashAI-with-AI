import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center m-8 fixed">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-red-500 rounded-full"></div>
        <span className="text-lg font-semibold text-foreground">FlashAI<span className='text-red-500'>.</span></span>
      </div>
      <div className="ml-16 mx-auto">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition duration-400 mr-4">Home</Link>
        <Link href="/decks" className="text-muted-foreground hover:text-foreground transition duration-400 mr-4">My Decks</Link>
      </div>
    </nav>
  )
}