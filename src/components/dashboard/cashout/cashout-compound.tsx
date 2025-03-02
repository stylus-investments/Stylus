/* eslint-disable react/no-unescaped-entities */
'use client'
import { trpc } from '@/app/_trpc/client'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { BASE_CHAIN_ID, SPHP, USDC_ADDRESS } from '@/lib/token_address'
import { cashoutFormSchema, compoundFormSchema, tCompoundFormSchema } from '@/types/cashoutType'
import { HandCoins, LoaderCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod' // Import zod resolver for react-hook-form
import { Checkbox } from '@/components/ui/checkbox'
import { TOKENRECEIVER_ADDRESS } from '@/constant/receiverAddress'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { ABI } from '@/constant/abi'

const CashoutCompound = () => {

    const [open, setOpen] = useState(false)

    const form = useForm<tCompoundFormSchema>({
        resolver: zodResolver(compoundFormSchema),
        defaultValues: {
            amount: "",
            token_name: "SPHP"
        },
    })
    const [loading, setLoading] = useState(false)

    const wallet = useWallets().wallets.find(item => item.walletClientType === 'privy')

    const phpRate = trpc.currency.getSingle.useQuery("PHP")

    const [tokenAddress, setTokenAddress] = useState(SPHP)

    const { refetch } = trpc.dashboard.getWalletData.useQuery(undefined, {
        enabled: false
    })

    const { isPending, mutateAsync } = trpc.cashout.cashoutCompound.useMutation({
        onError: (e) => toast.error(e.message),
        onSuccess: () => {
            refetch()
            toast.success("Success! Your tokens has been converted into sAVE.")
            setOpen(false)
        }
    })
    const onSubmit = async (values: tCompoundFormSchema) => {
        try {

            if (!wallet) return toast.error("Something went wrong, please refresh the page.")

            const { amount } = values
            // Proceed with mutation if the form data is valid

            setLoading(true)
            // Check if amount is greater than 0
            if (Number(amount) <= 0) {
                setLoading(false)
                return toast.error("Amount must be greater than 0");
            }

            await wallet.switchChain(BASE_CHAIN_ID)
            const provider = await wallet.getEthersProvider()
            const signer = provider.getSigner() as any
            const tokenContract = new ethers.Contract(tokenAddress, ABI, signer);
            const decimals = await tokenContract.decimals()
            // Get the user's balance
            const userAddress = wallet.address // Get user's wallet address
            const userBalance = await tokenContract.balanceOf(userAddress);

            // console.log("Balance", userBalance)

            // Convert the user's balance to a readable format
            const readableBalance = ethers.formatUnits(userBalance, decimals)
            // console.log("Readable Balance", readableBalance, amount)

            if (Number(readableBalance) < Number(amount)) {
                setLoading(false)
                return toast.error("You don't have enough token.")
            }

            const convertedAmount = ethers.parseUnits(amount, decimals)

            // console.log("Converted Amount", convertedAmount)

            const transactionResponse = await tokenContract.transfer(TOKENRECEIVER_ADDRESS, convertedAmount)
            // console.log(transactionResponse)

            // const reciept = await transactionResponse.wait()

            // console.log("Receipt", reciept)

            toast.success("Transaction in progress: Your tokens have been received and are being processed for conversion. Please wait for confirmation.")

            await mutateAsync({
                data: values,
                hash: transactionResponse.hash
            })

            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error("Something went wrong.")
            console.error('Error sending token:', error);
        }
    }


    // if (!data) return (
    //     <Button className='w-28' disabled>Compound</Button>
    // )

    return (
        <div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button className='w-28'>Compound</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='max-w-96'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Compound Token</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to convert SPHP to sAVE.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">

                            {/* <div className='w-full flex items-center gap-5'>
                                <FormField
                                    control={form.control}
                                    name='token_name'
                                    render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel>Select Token</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    onValueChange={(val) => field.onChange(val)}
                                                >
                                                    <SelectTrigger >
                                                        <SelectValue placeholder="Select Token" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="SPHP">SPHP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div> */}

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type='number' placeholder="Amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("amount") && <Label className='pt-2'>sAVE Conversion: {(form.watch("amount") && phpRate.data) && (Number(form.watch("amount")) / Number(phpRate.data.conversion_rate)).toFixed(6)}</Label>}
                            <Separator />
                            <div className='flex w-full items-center gap-5 '>
                                <Button type='button' variant={'secondary'} className='w-full' onClick={() => setOpen(false)}>Close</Button>
                                <Button className='w-full' disabled={loading}>{loading ? <LoaderCircle size={18} className='animate-spin' /> : "Confirm"}</Button>
                            </div>
                        </form>
                    </Form>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default CashoutCompound