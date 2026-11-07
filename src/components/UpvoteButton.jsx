import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function UpvoteButton({ richiestaId, initialCount = 0 }) {
  const { user } = useAuth()
  const [count, setCount] = useState(initialCount)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    checkVoteStatus()
  }, [richiestaId, user])

  async function checkVoteStatus() {
    setLoading(true)
    const { data } = await supabase
      .from('upvotes')
      .select('user_id')
      .eq('richiesta_id', richiestaId)
    
    if (data) {
      setCount(data.length)
      setHasVoted(data.some(v => v.user_id === user.id))
    }
    setLoading(false)
  }

  async function handleToggle() {
    if (!user || loading) return
    
    // Optimistic UI update
    const newHasVoted = !hasVoted
    setHasVoted(newHasVoted)
    setCount(prev => newHasVoted ? prev + 1 : prev - 1)
    setLoading(true)

    try {
      if (newHasVoted) {
        await supabase.from('upvotes').insert({ richiesta_id: richiestaId, user_id: user.id })
      } else {
        await supabase.from('upvotes').delete().eq('richiesta_id', richiestaId).eq('user_id', user.id)
      }
    } catch (err) {
      // Revert on error
      setHasVoted(!newHasVoted)
      setCount(prev => !newHasVoted ? prev + 1 : prev - 1)
      console.error('Errore upvote:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={`upvote-btn ${hasVoted ? 'active' : ''}`} 
      onClick={handleToggle}
      disabled={loading || !user}
      title={hasVoted ? "Rimuovi upvote" : "Metti upvote"}
    >
      <span className="upvote-icon">🔥</span>
      <span className="upvote-count">{count}</span>
    </button>
  )
}