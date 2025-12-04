"use server";


import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { User } from "@prisma/client";
import { redirect } from "next/navigation";

export const getAuthDetails = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      agency: {
        include: {
          SidebarOptions: true,
          SubAccounts: {
            include: {
              sidebarOptions: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });

  return userData;
};


export const createTeamUser = async (agencyId: string , user: User   ) => 
{
    if(user.role === "AGENCY_OWNER") return null;

    const response = await db.user.create({
        data:{...user
        }
    })
    return response;
}

// export const saveActivityLogNotification = async (agencyId: string, user: User) => {
    
        
//     agencyId,
// userId: user.id,
// subAccountId: user.agencyId,
    
// }



export const verifyAndAccpetInvitations = async () => {
    const user = await currentUser();
    if(!user) return redirect("/agency/sign-in")
    const invitationsExist = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress, status: "PENDING"
         },
    })
    if(invitationsExist){
        const userDetails = await createTeamUser(invitationsExist.agencyId, {
            email: invitationsExist.email,
            agencyId: invitationsExist.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationsExist.role,
            createdAt: new Date(),
            updatedAt: new Date(),
            password: null, 
        });
    }
}
