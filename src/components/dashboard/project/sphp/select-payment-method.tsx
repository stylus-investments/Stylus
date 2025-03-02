import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PAYMENT_METHOD } from '@/constant/order'

const SPHPSelectPayment = (props: {
  formData: {
    amount: string;
    method: string;
    receipt: string;
    status: number;
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    amount: string;
    method: string;
    receipt: string;
    status: number;
  }>>
  closeOrder: () => void
}) => {

  const { setFormData, formData, closeOrder } = props
  const [open, setOpen] = useState(false)

  const confirmAmount = () => {
    const { amount, method } = formData
    if (!method) return toast.error("Payment method is required")
    if (isNaN(Number(amount))) {
      return toast.error("Amount and price should be valid numbers");
    }
    if ((Number(amount) <= 0)) return toast.error("Amount should be positive number")

    setFormData(prev => ({ ...prev, status: 2 }))
  }


  return (
    <div className='flex flex-col gap-5'>
      <h1 className='border-b pb-5 text-lg'>Order Form</h1>
      <div className='flex flex-col gap-2'>
        <Label>Payment Method</Label>
        <div className='flex items-center w-full gap-5'>
          {Object.keys(PAYMENT_METHOD).map((method, i) => (
            <Button
              key={i}
              variant={method === formData.method ? "default" : "secondary"}
              value={method}
              onClick={() => {
                setFormData(prev => ({ ...prev, method: method }))
                setOpen(false)
              }}
              className='uppercase w-full'
            >
              {method}
            </Button>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Amount (sPHP)</Label>
        <Input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Price</Label>
        <div className='flex items-center gap-3'>
          ₱1 = 1 sPHP
        </div>
      </div>
      <div className='flex items-center justify-between w-full pt-5 border-t'>
        <Button variant={'ghost'} className='w-32' type='button' onClick={closeOrder}>Close</Button>
        <Button className='w-32' type='button' onClick={confirmAmount}>Next</Button>
      </div>
    </div>
  )
}

export default SPHPSelectPayment