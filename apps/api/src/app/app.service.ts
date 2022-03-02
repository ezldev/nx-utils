import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@nx-utils/api-interfaces';

import * as AWS from 'aws-sdk';
import { AnyNaptrRecord, AnyRecord } from 'dns';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import * as _ from 'lodash';
import { zip,forkJoin , from} from 'rxjs';
import { tap } from 'rxjs/operators'

@Injectable()
export class AppService {
  cloudformation:AWS.CloudFormation
  stackList=[]
  private readonly logger = new Logger(AppService.name);
  constructor(){
    AWS.config.update({ region: process.env.region });
    AWS.config.apiVersions = {
      cloudformation: '2010-05-15',
      // other service API versions
    };
    this.cloudformation = new AWS.CloudFormation();
  }
  async getData(): Promise<any> {
    const self = this
    return new Promise<any>((resolve, reject) => {


      //const cloudformation = new AWS.CloudFormation();

      let stackSummaries =[]


      this.cloudformation.listStacks({}, function (err, data) {
       //console.log(data)
        if (err){
          console.log(err, err.stack);
          //reject(err)
        }
        // an error occurred
        else {

          stackSummaries = data.StackSummaries
          console.log("--",stackSummaries)
          //resolve(data);
          //console.log(stackSummaries)
          const pa =  _.map(stackSummaries,(stackObject:any)=>{
            return stackObject.StackName
          })
          console.log("--",pa)
          const source$ = zip(_.map(stackSummaries,(stackObject:any)=>{
           // console.log("^^^",self.getStackDetails(stackObject.StackName))
            return self.getStackDetails(stackObject.StackId)
          }))
          source$.subscribe((pa:any) =>{
            //console.log(pa)
            //resolve(pa)
            stackSummaries =_.map(stackSummaries, (stackObject:any, index)=>{
              stackObject.stackResources = pa[index].StackResourceSummaries
              return stackObject
            })
            resolve(stackSummaries)
          })
        }
      });

    });

    // console.log(myAsynFunction())
  }
  async getAvailableStacks():Promise<any>{
    const self = this
    return new Promise<any>((resolve, reject) => {
      this.logger.log("In get available stacks")
      this.cloudformation.listStacks({}, function (err, data) {
        //this.logger.log("list of staks" + JSON.stringify(data))
       // console.log(data)
        if(err){
          reject(err)
        }else{
          data.StackSummaries
          const pa =  _.map(data.StackSummaries,(stackObject:any)=>{
            return stackObject.StackName
          })
         // console.log(pa)
          //this.logger.log("pa" + JSON.stringify(pa))
          const source$ = zip(_.map(data.StackSummaries,(stackObject:any)=>{
            return self.processStack(stackObject)
          }))
          source$.subscribe((res:any) =>{
           console.log("res", res)
           //let final=[]
           _.forEach(data.StackSummaries, (stackObject:any, index)=>{

            stackObject.data = res[index]

            // _.forEach(res, (resObj:any)=>{
              //   stackObject.data = resObj
              // })
              //stackObject.Stacks = res[0][index].Stacks
              //stackObject.StackResourceSummaries = res[1][index].StackResourceSummaries
              //this.logger.log("stackResources" , stackObject)

              //final.push(stackObject)
            })
            resolve(data.StackSummaries)
        })
      }
    })
  })
}

async processStack(stackObject): Promise<any>{
  return new Promise<any>((resolve, reject) => {
  console.log(stackObject.StackId)
    const source$ = zip(
      this.getStackDescription(stackObject.StackId),
      this.getStackDetails(stackObject.StackId),
      this.getTemplate(stackObject.StackId)
    )
    source$.subscribe((res:any) =>{
        resolve(res)
    })
  })
}

  async getStackDescription(StackId): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      //console.log("in get stack details",stackObject)
      const params = {
        StackName: StackId
      };
      this.cloudformation.describeStacks(params, function(err, data) {
        //console.log("in stack desc",data)
        if(err){
          reject(err)
        }else{
          resolve({Stacks:data.Stacks})
        }
      });
    })
  }

  async getStackEstimate(templateBody): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      //console.log("in get stack details",stackObject)
      //const params = {
      //   Parameters: [
      //     {
      //       ParameterKey: 'STRING_VALUE',
      //       ParameterValue: 'STRING_VALUE',
      //       ResolvedValue: 'STRING_VALUE',
      //       UsePreviousValue: true || false
      //     },
      //     /* more items */
      //   ],
      //   TemplateBody: 'STRING_VALUE',
      //   TemplateURL: 'STRING_VALUE'
      // };
      const params = {
        TemplateBody:templateBody
      };
      this.cloudformation.estimateTemplateCost(params, function(err, data) {
        if(err){
          reject(err)
        }else{
          resolve(data)
        }          // successful response
      });
    })
  }

  async getTemplate(StackId):Promise<any>{
    const self = this
    return new Promise<any>((resolve, reject) => {
      const params = {
        StackName: StackId,
      };
      this.cloudformation.getTemplate(params, function(err, data) {
        if (err) reject(err) // an error occurred
        else   {
          console.log(data)
          resolve({data})
          // self.getStackEstimate(data.TemplateBody).then((estimate:any)=>{
          //   resolve({data,estimate})
          // })
        }
          //resolve(data)}          // successful response
      });

    })
  }

  async getStackDetails(StackId): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      //console.log("in get stack details",stackObject)

      const params = {
        StackName: StackId
      };
      //console.log("getting info for stack " + stackObject.StackName)
      this.cloudformation.listStackResources(params, function(err, data) {
        //console.log("in stack details",data)
        //console.log(data)
        //stackObject.StackResourceSummaries = data.StackResourceSummaries
        if (err) reject(err) // an error occurred
        else   {
          //console.log(data)
          resolve({data})}            // successful response
      });

    })
  }

}
