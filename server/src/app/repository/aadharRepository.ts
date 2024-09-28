import mongoose from 'mongoose';
import AadharModel from '../../entities/aadharInfo';
import { IRepository } from '../../interfaces/iRepository';
import AadhaarInfo from '../../interfaces/iAadhar';

export default class aadharRepository implements IRepository {
  createAadharDoc = async (data: AadhaarInfo): Promise<AadhaarInfo | null> => {
    try {
      const existingAadharDoc = await AadharModel.findOne({
        aadharNumber: data.aadhaarNumber,
      });

      // If a document is found, return the existing document
      if (existingAadharDoc) {
        console.log(
          `Aadhar document already exists for aadharNumber: ${data.aadhaarNumber}`
        );
        return existingAadharDoc.toObject() as AadhaarInfo;
      }

      // If no document is found, create a new instance and save it
      const newAadharDoc = new AadharModel(data);
      const savedAadharDoc = await newAadharDoc.save();

      // Return the newly created document
      return savedAadharDoc.toObject() as AadhaarInfo;
    } catch (err) {
      console.error(`Error creating personal chat: ${err}`);
      return null;
    }
  };
}
