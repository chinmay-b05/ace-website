import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable('user', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    image: text("image"),
    password: text("password").notNull(),
    role: text("password", { enum: ["CORE", "MEMBER", "ADMIN"] }).default("MEMBER").notNull(),
    joinedOn: text("joined_on").default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const eventTable = sqliteTable('event', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    image: text("image").notNull(),
    deadline: text("deadline"),
    fromDate: text("from_date").notNull(),
    toDate: text("to_date").notNull(),
    description: text("description").notNull(),
    venue: text("venue").notNull(),
    minTeamSize: integer('min_team_size', { mode: 'number' }).default(1).notNull(),
    maxTeamSize: integer('max_team_size', { mode: 'number' }).default(1).notNull(),
    maxTeams: integer('maxTeams', { mode: 'number' }),
    state: text("state", { enum: ["DRAFT", "PUBLISHED", "LIVE", "COMPLETED"] }).default("DRAFT").notNull(), //enum
    category: text("category", { enum: ["WORKSHOP", "HACKATHON", "COMPETITION", "SPECIAL"] }).notNull(),  //enum
    amount: integer('amount', { mode: 'number' }).default(0).notNull(),
    // state            EventState @default (DRAFT)
    // isLegacy         Boolean @default (false)
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const teamTable = sqliteTable('team', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    isConfirmed: integer("is_confirmed", { mode: "boolean" }).default(false).notNull(),
    hasAttended: integer("has_attended", { mode: "boolean" }).default(false).notNull(),
    eventId: integer("event_id").references(() => eventTable.id).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const organiserTable = sqliteTable('organiser', {
    eventId: integer("event_id").references(() => eventTable.id).notNull(),
    userId: integer("user_id").references(() => eventTable.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.eventId, table.userId] }),
    }
});

export const winnerTable = sqliteTable('winner', {
    type: text("type", { enum: ["WINNER", "RUNNER_UP", "SECOND_RUNNER_UP"] }).notNull(),
    eventId: integer("event_id").references(() => eventTable.id).notNull(),
    teamId: integer("user_id").references(() => teamTable.id).notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.eventId, table.teamId] }),
    }
});

export const blogTable = sqliteTable('blog', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    image: text("image"),
    description: text("description").notNull(),
    content: text("content").notNull(),
    state: text("state", { enum: ["DRAFT", "PUBLISHED"] }).default("DRAFT").notNull(),
    authorId: integer("author_id").references(() => userTable.id).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const commentsTable = sqliteTable('Comment', {
    userId: integer("user_id").references(() => userTable.id).notNull(),
    blogId: integer("recipe_id").references(() => blogTable.id).notNull(),
    content: text("content").notNull(),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.blogId] }),
    };
});

export const viewTable = sqliteTable('View', {
    userId: integer("user_id").references(() => userTable.id).notNull(),
    blogId: integer("blog_id").references(() => blogTable.id).notNull(),
    liked: integer("liked", { mode: "boolean" }).default(false)
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.blogId] }),
    };
});

// model Certificate {
//     id              String @id @default (cuid())
//     issuedOn        DateTime
//     certificateType WINNER RUNNER_UP SECOND_RUNNER_UP PARTICIPATION
  
//     eventId Int
//     Event   Event @relation(fields: [eventId], references: [id])
  
//     userId Int
//     User   User @relation(fields: [userId], references: [id])
  
//     createdAt DateTime @default (now())
//     updatedAt DateTime @updatedAt

//     @@unique([eventId, userId])
//     @@index([userId, eventId])
// }
  
//   model Payment {
//     id          String @id @default (cuid())
//     paymentName String
//     amount      Int
  
//     verified    Boolean @default (false)
//     paymentType MEMBERSHIP EVENT
  
//     razorpayOrderId   String
//     razorpayPaymentId String
//     razorpaySignature String
  
//     User User ?
//         Team Team ?

//             createdAt DateTime @default (now())
//     updatedAt DateTime @updatedAt
// }

// import { column, defineDb, defineTable, NOW } from 'astro:db';

// const User = defineTable({
//   columns: {
//     id: column.text({ primaryKey: true }),  //autoicrement
//     name: column.text(),
//     email: column.text(),
//     image: column.text(),
//     role: column.text(),  //default enum
//     createdAt: column.date({ default: NOW })
//   }
// })

// const Event = defineTable({
//   columns: {
//     id: column.text({ primaryKey: true }),  //autoicrement
//     name: column.text(),
//     email: column.text(),
//     image: column.text(),
//     deadline: column.date(),
//     fromDate: column.date(),
//     toDate: column.date(),
//     description: column.text(),
//     venue: column.text(),
//     minTeamSize: column.number({ default: 1 ,}),
//     maxTeamSize: column.number({ default: 1 }),
//     maxTeams: column.number({ optional: true }),
//     state:column.text({default:"DRAFT"}), //enum
//     type: column.text(),  //enum
//     amount: column.number({ default: 0 }),
//     // state            EventState @default (DRAFT)
//     // isLegacy         Boolean @default (false)
//     createdAt: column.date({ default: NOW })
//   }
// })

// const Team = defineTable({
//   columns: {
//     id: column.text({ primaryKey: true }),  //autoicrement
//     name: column.text(),
//     isConfirmed: column.boolean({ default: false }),
//     hasAttended: column.boolean({ default: false }),
//     createdAt: column.date({ default: NOW }),

//     eventId: column.text(),
//   },
//   foreignKeys: [
//     {
//       columns: ["eventId"],
//       references: () => [Event.columns.id],
//     },
//   ],
// })

// const Organiser = defineTable({
//   columns: {
//     id: column.text({ primaryKey: true }),  //autoicrement
//     userId:column.text(),
//     eventId: column.text(),
//   },
//   foreignKeys: [
//     {
//       columns: ["eventId"],
//       references: () => [Event.columns.id],
//     },
//   ],
// })