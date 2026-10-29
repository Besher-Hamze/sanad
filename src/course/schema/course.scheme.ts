import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';




export type TeacherDocument = HydratedDocument<Teacher>;

@Schema({ timestamps: true })
export class Teacher {
  @Prop({
    required: true,
    default: 'TEST COURSE',
  })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0 })
  seat: number;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({
    required: true,
    default: 'TEST COURSE',
  })
  name: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0 })
  seat: number;
  

  @Prop({
   ref:Teacher.name,
  })
  teacherId:string
}

export const CourseSchema = SchemaFactory.createForClass(Course);

