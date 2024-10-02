import { relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  year: integer('year', { mode: 'number' }),
  role: text('role', { enum: ['CORE', 'MEMBER', 'ADMIN'] })
    .default('MEMBER')
    .notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  joinedOn: text('joined_on')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  photo: text('photo'),
  linkedIn: text('linkedIn'),
  github: text('github'),
  instagram: text('instagram'),
});

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const eventTable = sqliteTable('event', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  image: text('image').notNull(),
  deadline: text('deadline'),
  fromDate: text('from_date').notNull(),
  toDate: text('to_date').notNull(),
  description: text('description').notNull(),
  venue: text('venue').notNull(),
  minTeamSize: integer('min_team_size', { mode: 'number' }).default(1).notNull(),
  maxTeamSize: integer('max_team_size', { mode: 'number' }).default(1).notNull(),
  maxTeams: integer('maxTeams', { mode: 'number' }),
  state: text('state', { enum: ['DRAFT', 'PUBLISHED', 'LIVE', 'COMPLETED'] })
    .default('DRAFT')
    .notNull(), //enum
  category: text('category', {
    enum: ['WORKSHOP', 'HACKATHON', 'COMPETITION', 'SPECIAL'],
  }).notNull(), //enum
  amount: integer('amount', { mode: 'number' }).default(0).notNull(),
  // state            EventState @default (DRAFT)
  // isLegacy         Boolean @default (false)
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const teamTable = sqliteTable('team', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  isConfirmed: integer('is_confirmed', { mode: 'boolean' }).default(false).notNull(),
  hasAttended: integer('has_attended', { mode: 'boolean' }).default(false).notNull(),
  eventId: integer('event_id')
    .references(() => eventTable.id)
    .notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userTeamTable = sqliteTable(
  'user_team',
  {
    userId: text('user_id')
      .references(() => userTable.id)
      .notNull(),
    teamId: integer('team_id')
      .references(() => teamTable.id)
      .notNull(),
    teamLeader: integer('team_leader', { mode: 'boolean' }).default(false),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.teamId] }),
    };
  },
);

export const organiserTable = sqliteTable(
  'organiser',
  {
    eventId: integer('event_id')
      .references(() => eventTable.id)
      .notNull(),
    userId: text('user_id')
      .references(() => userTable.id)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.eventId, table.userId] }),
    };
  },
);

export const winnerTable = sqliteTable(
  'winner',
  {
    type: text('type', {
      enum: ['WINNER', 'RUNNER_UP', 'SECOND_RUNNER_UP'],
    }).notNull(),
    eventId: integer('event_id')
      .references(() => eventTable.id)
      .notNull(),
    teamId: integer('team_id')
      .references(() => teamTable.id)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.eventId, table.teamId] }),
    };
  },
);

export const blogTable = sqliteTable('blog', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  image: text('image'),
  description: text('description').notNull(),
  content: text('content').notNull(),
  state: text('state', { enum: ['DRAFT', 'PUBLISHED'] })
    .default('DRAFT')
    .notNull(),
  authorId: text('author_id')
    .references(() => userTable.id)
    .notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const commentsTable = sqliteTable(
  'Comment',
  {
    userId: text('user_id')
      .references(() => userTable.id)
      .notNull(),
    blogId: integer('blog_id')
      .references(() => blogTable.id)
      .notNull(),
    content: text('content').notNull(),
    updatedAt: text('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: text('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.blogId] }),
    };
  },
);

export const viewTable = sqliteTable(
  'View',
  {
    userId: text('user_id')
      .references(() => userTable.id)
      .notNull(),
    blogId: integer('blog_id')
      .references(() => blogTable.id)
      .notNull(),
    liked: integer('liked', { mode: 'boolean' }).default(false),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.blogId] }),
    };
  },
);

// //RELATIONS

export const userTableRelations = relations(userTable, ({ one, many }) => ({
  teams: many(userTeamTable),
  blogs: many(blogTable),
  views: many(viewTable),
  comments: many(commentsTable),
  organiser: many(organiserTable),
  accounts: one(accounts),
}));

export const accountsTableRelations = relations(accounts, ({ one }) => ({
  user: one(userTable, {
    fields: [accounts.userId],
    references: [userTable.id],
  }),
}));

export const eventTableRelations = relations(eventTable, ({ many }) => ({
  teams: many(teamTable),
  organiser: many(organiserTable),
  winner: many(winnerTable),
}));

export const teamTableRelations = relations(teamTable, ({ many, one }) => ({
  event: one(eventTable, {
    fields: [teamTable.eventId],
    references: [eventTable.id],
  }),
  users: many(userTeamTable),
}));

export const userTeamTableRelations = relations(userTeamTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userTeamTable.userId],
    references: [userTable.id],
  }),
  team: one(teamTable, {
    fields: [userTeamTable.teamId],
    references: [teamTable.id],
  }),
}));

export const blogTableRelations = relations(blogTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [blogTable.authorId], // Foreign key field
    references: [userTable.id],
  }),
  comments: many(commentsTable),
  views: many(viewTable),
}));

export const commentsTableRelations = relations(commentsTable, ({ one }) => ({
  blog: one(blogTable, {
    fields: [commentsTable.blogId],
    references: [blogTable.id],
  }),
  user: one(userTable, {
    fields: [commentsTable.userId],
    references: [userTable.id],
  }),
}));

export const viewTableRelations = relations(viewTable, ({ one }) => ({
  user: one(userTable, {
    fields: [viewTable.userId],
    references: [userTable.id],
  }),
  blog: one(blogTable, {
    fields: [viewTable.blogId],
    references: [blogTable.id],
  }),
}));

export const organiserTableRelations = relations(organiserTable, ({ one }) => ({
  user: one(userTable, {
    fields: [organiserTable.userId],
    references: [userTable.id],
  }),
  event: one(eventTable, {
    fields: [organiserTable.eventId],
    references: [eventTable.id],
  }),
}));

export const winnerTableRelations = relations(winnerTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [winnerTable.teamId],
    references: [teamTable.id],
  }),
  event: one(eventTable, {
    fields: [winnerTable.eventId],
    references: [eventTable.id],
  }),
}));
