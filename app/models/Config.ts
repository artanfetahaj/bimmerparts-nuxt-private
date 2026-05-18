/* eslint-disable */
import  environments , { type Environment } from './environments';
import Session from './Session';
import Storage from './Storage';

export class Config {
  public static environment: Environment;

  public static environments: Environment[] = environments;

  public static setEnvironment(environment?: Environment) {
    if (!environment) {
      environment = environments[0];
    }

    Config.environment = environment;
  }

  public static get(key: string): ConfigValue {
    if (Session.has(key)) {
      return Session.get(key) as ConfigValue;
    }

    if (Storage.has(key)) {
      return Storage.get(key) as ConfigValue;
    }

    if (! Config.environment) {
      Config.setEnvironment();
    }

    return Config.environment?.config[key];
  }

  public static set(key: string, value: ConfigValue): ConfigValue {
    if (! Config.environment) {
      Config.setEnvironment();
    }

    if (! Config.environment) {
      return;
    }

    Storage.set(key, `${value}`);

    return Config.environment.config[key] = value;
  }

  public static all(): { [key: string]: ConfigValue } {
    if (! Config.environment) {
      Config.setEnvironment();
    }

    if (! Config.environment) {
      return {};
    }

    return Config.environment.config;
  }
}

export type ConfigValue = boolean | string | number | undefined;
