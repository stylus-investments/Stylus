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
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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

    const contactInfo = initialInfo.emergency_contact[0];

    const returnStatus = () => {
      if (contactInfo?.status) {
        switch (contactInfo.status) {
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
                Emergency Contact Verified
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
          
           <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <Link href={`/admin/user/${params.user_id}`} className="hover:text-foreground">
                        User Profile
                      </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Emergency Contact</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
          
          <div className="flex flex-col gap-1 border-b pb-3">
            <Label className="text-2xl font-black">User Emergency Contact Info</Label>
            <div className="w-full flex flex-wrap items-center justify-between gap-y-3">
              <div className="text-muted-foreground">
                View user emergency contact information.
              </div>
              <div className="flex gap-5 items-center">
                {returnStatus()}
              </div>
            </div>
            {contactInfo.verification_message && (
              <div className="w-full flex items-center gap-3 bg-destructive text-white px-3 mt-2 py-2 rounded-lg">
                <CircleX size={30} className="w-10" />
                <div>{contactInfo.verification_message}</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-8 w-full">
            <div className="flex flex-col w-full  gap-2">
              <Label>Full Name</Label>
              <div className="w-full flex items-center gap-3">
                <Input
                  required
                  name="first_name"
                  className="w-full cursor-pointer"
                  value={contactInfo.first_name}
                />
                <Input
                  required
                  name="last_name"
                  className="w-full cursor-pointer"
                  value={contactInfo.last_name}
                />
              </div>
              <small className="text-muted-foreground">
                Enter your full name as it appears on your official documents.
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
                value={contactInfo.email}
              />
              <small className="text-muted-foreground">
                This is your linked email address.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                required
                type="number"
                name="age"
                className="w-full cursor-pointer"
                value={contactInfo.age}
              />
              <small className="text-muted-foreground">
                Please provide your age for verification purposes.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="mobile">Phone Number</Label>
              <Input
                required
                name="mobile"
                className="w-full cursor-pointer"
                value={contactInfo.mobile}
              />
              <small className="text-muted-foreground">
                This is your linked phone number for account verification.
              </small>
            </div>
            <div className="flex flex-col w-full  gap-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !contactInfo.birth_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {contactInfo.birth_date ? (
                  new Date(contactInfo.birth_date).toDateString()
                ) : (
                  <span>No Birthdate Provided</span>
                )}
              </Button>
              <small className="text-muted-foreground">
                Your birthdate helps us verify your identity.
              </small>
            </div>
            <div></div>
            <div className="flex flex-col gap-3 w-full ">
              {contactInfo.front_id && (
                <Image
                  src={contactInfo.front_id}
                  alt="Front ID"
                  width={500}
                  height={200}
                  className="w-full flex bg-secondary h-64 object-contain"
                />
              )}
              <small className="text-muted-foreground">User ID (front)</small>
            </div>
            <div className="flex flex-col gap-3 w-full ">
              {contactInfo.back_id && (
                <Image
                  src={contactInfo.back_id}
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
              emergency_contact_id={contactInfo.id}
            />
            <UpdateUserStatus
              user_id={initialInfo.user_id}
              status={ProfileStatus.VERIFIED}
              emergency_contact_id={contactInfo.id}
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
