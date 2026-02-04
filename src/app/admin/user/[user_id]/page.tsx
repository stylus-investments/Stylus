import { caller } from "@/app/_trpc/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CircleCheckBig,
  CircleOff,
  CircleX,
  Clock,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import AdminHeader from "@/components/admin/admin-header";
import { UpdateUserStatus } from "@/components/admin/user/update-user-profile";
import { ProfileStatus } from "@prisma/client";
const Page = async ({
  params,
}: {
  params: {
    user_id: string;
  };
}) => {
  try {
    const decodedUserId = decodeURIComponent(params.user_id);

    const initialInfo = await caller.user.getUserProfile({
      user_id: decodedUserId,
    });

    const returnStatus = () => {
      if (initialInfo?.status) {
        switch (initialInfo.status) {
          case "INVALID":
            return (
              <Button
                type="button"
                variant={"destructive"}
                className="flex items-center text-base gap-2"
              >
                <CircleOff size={18} />
                Invalid
              </Button>
            );
          case "PENDING":
            return (
              <Button
                type="button"
                variant={"secondary"}
                className="flex items-center text-base gap-2"
              >
                <Clock size={18} />
                Pending Verification
              </Button>
            );
          case "VERIFIED":
            return (
              <Button
                variant={"outline"}
                type="button"
                className="flex items-center text-base gap-2"
              >
                <CircleCheckBig size={18} />
                Profile Verified
              </Button>
            );
          default:
            return null;
        }
      }
    };

    return (
      <div>
        <AdminHeader currentPage="user" />
        <form className="padding py-28 flex flex-col gap-10">
          <div className="flex flex-col gap-1 border-b pb-3">
            <Label className="text-2xl font-black">User Profile Info</Label>
            <div className="w-full flex flex-wrap items-center justify-between gap-y-3">
              <div className="text-muted-foreground">
                View user profile information.
              </div>
              <div className="flex gap-5 items-center">
               {initialInfo.emergency_contact[0] && initialInfo.emergency_contact[0].email ? <Link href={`/admin/user/${params.user_id}/emergency`}>
                  <Button variant={"destructive"}>Emergency Contact</Button>
                </Link>: <Button type="button" variant={'outline'}>Emergency Contact is Empty</Button>}
                {returnStatus()}
              </div>
            </div>
            {initialInfo.verification_message && (
              <div className="w-full flex items-center gap-3 bg-destructive text-white px-3 mt-2 py-2 rounded-lg">
                <CircleX size={30} className="w-10" />
                <div>{initialInfo.verification_message}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-8 w-full">
            <div className="flex flex-col w-full  gap-2">
              <Label>Wallet Address</Label>
              <Input
                readOnly
                className="w-full cursor-pointer"
                value={initialInfo.wallet}
              />
              <small className="text-muted-foreground">
                 User wallet address is displayed above.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label>Full Name</Label>
              <div className="w-full flex items-center gap-3">
                <Input
                  required
                  name="first_name"
                  className="w-full cursor-pointer"
                  value={initialInfo.first_name}
                />
                <Input
                  required
                  name="last_name"
                  className="w-full cursor-pointer"
                  value={initialInfo.last_name}
                />
              </div>
              <small className="text-muted-foreground">
                Full name of the user.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                readOnly={true}
                required
                type="email"
                name="email"
                className="w-full cursor-pointer"
                value={initialInfo.email}
              />
              <small className="text-muted-foreground">
                This is the user linked email address.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                required
                type="number"
                name="age"
                className="w-full cursor-pointer"
                value={initialInfo.age}
              />
              <small className="text-muted-foreground">
                User age.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="mobile">Phone Number</Label>
              <Input
                required
                name="mobile"
                className="w-full cursor-pointer"
                value={initialInfo.mobile}
              />
              <small className="text-muted-foreground">
                User linked phone number.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !initialInfo.birth_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {initialInfo.birth_date ? (
                  new Date(initialInfo.birth_date).toDateString()
                ) : (
                  <span>No Birthdate Provided</span>
                )}
              </Button>
              <small className="text-muted-foreground">
                User Birthdate
              </small>
            </div>
            <div className="flex flex-col gap-3 w-full ">
              {initialInfo.front_id && (
                <Image
                  src={initialInfo.front_id}
                  alt="Front ID"
                  width={500}
                  height={200}
                  className="w-full flex bg-secondary h-64 object-contain"
                />
              )}
              <small className="text-muted-foreground">User ID (front)</small>
            </div>
            <div className="flex flex-col gap-3 w-full ">
              {initialInfo.back_id && (
                <Image
                  src={initialInfo.back_id}
                  alt="Back ID"
                  width={500}
                  height={200}
                  className="w-full h-64 object-contain bg-secondary"
                />
              )}
              <small className="text-muted-foreground">User ID (back)</small>
            </div>
          </div>
          <div className="border-t pt-5 w-full flex justify-center"></div>

          <div className="w-full flex items-center gap-5">
            <UpdateUserStatus
              user_id={initialInfo.user_id}
              status={ProfileStatus.INVALID}
            />
            <UpdateUserStatus
              user_id={initialInfo.user_id}
              status={ProfileStatus.VERIFIED}
            />
          </div>
        </form>
      </div>
    );
  } catch (error) {
    console.log(error);
  }
};

export default Page;
