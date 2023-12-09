import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationEmailResendingDto } from '../../../auth/dto';
import { Result, validateOrRejectModel } from '../../../../core';

export class RegistrationEmailResendingCommand {
  constructor(public resendingDto: RegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly userRegistrationInfoRepo: UserRegistrationInfoRepository,
  ) {}

  async execute({
    resendingDto,
  }: RegistrationEmailResendingCommand): Promise<Result> {
    await validateOrRejectModel(resendingDto, RegistrationEmailResendingDto);

    return Result.Ok();
  }
}
